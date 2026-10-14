'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserPlus, Trash2 } from 'lucide-react';

interface StaffMember {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('kitchen');
  const [invitedPass, setInvitedPass] = useState<string | null>(null);

  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.getStaff();
      return res.data.data as StaffMember[];
    },
  });

  const inviteStaff = useMutation({
    mutationFn: () => api.inviteStaff({ email, name, role }),
    onSuccess: (res) => {
      const data = res.data.data as { tempPassword: string };
      setInvitedPass(data.tempPassword);
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground text-sm">Invite and manage roles for your restaurant staff</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Invite Staff Member</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="manager">Manager</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="waiter">Waiter</option>
            </select>
          </div>
          <Button
            onClick={() => inviteStaff.mutate()}
            loading={inviteStaff.isPending}
            disabled={!email || !name}
          >
            <UserPlus size={16} className="mr-1" /> Invite Staff
          </Button>
          {invitedPass && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Staff invited! Temporary Password: <code>{invitedPass}</code>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staff?.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-sm">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => removeStaff.mutate(member.userId)}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
