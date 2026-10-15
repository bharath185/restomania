'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserPlus, Trash2, ShieldCheck, Users } from 'lucide-react';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';

interface StaffMember {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  role: string;
  user?: { id: string; name: string; email: string };
}

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('kitchen');
  const [invitedPass, setInvitedPass] = useState<string | null>(null);

  const activeRestaurant = multiTenantEngine.getActiveRestaurant();

  const { data: staff } = useQuery({
    queryKey: ['staff', activeRestaurant.id],
    queryFn: async () => {
      const res = await api.getStaff();
      return (res.data?.data ?? res.data) as unknown as StaffMember[];
    },
  });

  const inviteStaff = useMutation({
    mutationFn: () => api.inviteStaff({ email, name, role }),
    onSuccess: (res) => {
      const data = (res.data?.data ?? res.data) as { tempPassword?: string };
      setInvitedPass(data?.tempPassword ?? 'WelcomeStaff123!');
      setEmail('');
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const removeStaff = useMutation({
    mutationFn: (userId: string) => api.removeStaff(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Staff & Team Roles</h1>
          <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
            {activeRestaurant.name}
          </span>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Role-based access control for kitchen staff, floor waiters, and restaurant managers
        </p>
      </div>

      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Invite New Staff Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Staff Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />
            <Input
              type="email"
              placeholder="Staff Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />
            <select
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="manager">Restaurant Manager</option>
              <option value="kitchen">Kitchen Chef</option>
              <option value="waiter">Floor Waiter</option>
            </select>
          </div>

          <Button
            onClick={() => inviteStaff.mutate()}
            loading={inviteStaff.isPending}
            disabled={!email || !name}
            className="rounded-xl font-bold text-xs h-10 px-4"
          >
            <UserPlus size={15} className="mr-1.5" /> Send Staff Invite
          </Button>

          {invitedPass && (
            <p className="text-xs text-green-600 font-bold bg-green-500/10 p-3 rounded-xl border border-green-500/20">
              ✓ Staff credentials generated! Temporary Password: <code className="font-mono">{invitedPass}</code>
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <span>Active Team Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staff?.map((member, idx) => {
              const memberName = member.name || member.user?.name || 'Staff Member';
              const memberEmail = member.email || member.user?.email || 'staff@restaurant.com';
              const memberId = member.userId || member.id || String(idx);

              return (
                <div key={memberId} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-bold text-sm text-foreground">{memberName}</p>
                    <p className="text-xs text-muted-foreground">{memberEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize font-bold text-xs">
                      {member.role}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStaff.mutate(memberId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
