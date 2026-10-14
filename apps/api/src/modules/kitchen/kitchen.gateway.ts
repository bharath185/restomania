import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WS_EVENTS, WS_ROOM, OrderStatus } from '@repo/shared';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/kitchen',
})
export class KitchenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(KitchenGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_EVENTS.SUBSCRIBE_ROOM)
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (data.restaurantId) {
      void client.join(WS_ROOM.kitchen(data.restaurantId));
      void client.join(WS_ROOM.restaurant(data.restaurantId));
      this.logger.log(`Client ${client.id} joined restaurant ${data.restaurantId}`);
    }
  }

  @SubscribeMessage(WS_EVENTS.ORDER_ACCEPT)
  handleOrderAccept(
    @MessageBody() data: { orderId: string; restaurantId: string },
  ) {
    this.server
      .to(WS_ROOM.order(data.orderId))
      .emit(WS_EVENTS.ORDER_STATUS, {
        orderId: data.orderId,
        status: OrderStatus.ACCEPTED,
        timestamp: new Date().toISOString(),
      });
  }

  notifyNewOrder(restaurantId: string, order: unknown) {
    this.server
      .to(WS_ROOM.kitchen(restaurantId))
      .emit(WS_EVENTS.ORDER_NEW, { order });
    this.logger.log(`New order notification sent to kitchen:${restaurantId}`);
  }

  notifyOrderStatus(
    restaurantId: string,
    orderId: string,
    status: OrderStatus,
    updatedBy: string,
  ) {
    const payload = { orderId, status, updatedBy, timestamp: new Date().toISOString() };
    this.server.to(WS_ROOM.kitchen(restaurantId)).emit(WS_EVENTS.ORDER_STATUS, payload);
    this.server.to(WS_ROOM.order(orderId)).emit(WS_EVENTS.ORDER_STATUS, payload);
  }

  notifyStockUpdate(restaurantId: string, itemId: string, itemName: string, isInStock: boolean) {
    this.server
      .to(WS_ROOM.restaurant(restaurantId))
      .emit(WS_EVENTS.ITEM_STOCK_UPDATE, { itemId, itemName, isInStock });
  }
}
