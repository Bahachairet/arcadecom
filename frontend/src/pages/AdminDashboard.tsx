import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  storeName: string;
  description: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    api
      .get('/sellers/applications')
      .then((res) => setApplications(res.data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/sellers/approve/${id}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'APPROVED' } : app))
      );
    } catch {
      // handle error
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/sellers/reject/${id}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'REJECTED' } : app))
      );
    } catch {
      // handle error
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Seller Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground">No applications found.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-semibold">{app.storeName}</p>
                    <p className="text-sm text-muted-foreground">
                      by {app.user.displayName} ({app.user.email})
                    </p>
                    {app.description && (
                      <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        app.status === 'PENDING'
                          ? 'outline'
                          : app.status === 'APPROVED'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {app.status}
                    </Badge>
                    {app.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
