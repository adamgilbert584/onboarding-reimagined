import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getVerifications } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Verification } from '@/types/verification';
import { RefreshCw, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Verifications management tab with table and search
 */
export function VerificationsTab() {
  const { token } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVerifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await getVerifications(token);
      setVerifications(data);
      setFilteredVerifications(data);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [token]);

  // Filter by last name
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVerifications(verifications);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredVerifications(
        verifications.filter((v) =>
          v.last_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, verifications]);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const getDecisionBadge = (decision: string | null) => {
    if (!decision) return <Badge variant="outline">Pending</Badge>;
    if (decision === 'pass') return <Badge variant="default" className="bg-green-600">Pass</Badge>;
    if (decision === 'fail') return <Badge variant="destructive">Fail</Badge>;
    return <Badge variant="outline">{decision}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchVerifications} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Verifications Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredVerifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No verifications found matching your search' : 'No verifications yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {verification.first_name} {verification.last_name}
                    </TableCell>
                    <TableCell>
                      {verification.city && verification.state ? (
                        <span>{verification.city}, {verification.state}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{verification.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {getDecisionBadge(verification.decision)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {verification.reason || '-'}
                    </TableCell>
                    <TableCell>
                      {verification.latitude && verification.longitude && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openGoogleMaps(verification.latitude!, verification.longitude!)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
