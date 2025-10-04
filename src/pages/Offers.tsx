import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { useOffers, updateOfferStatus } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function Offers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { offers: allOffers, loading } = useOffers();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; icon: any }> = {
      draft: { variant: 'secondary', icon: FileText },
      pending_approval: { variant: 'default', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      sent: { variant: 'default', icon: Send },
      accepted: { variant: 'default', icon: CheckCircle },
      declined: { variant: 'destructive', icon: XCircle },
      expired: { variant: 'secondary', icon: Clock },
      withdrawn: { variant: 'secondary', icon: XCircle },
    };

    const config = statusMap[status] || statusMap.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleStatusChange = async (offerId: string, newStatus: string) => {
    if (!user) return;

    setUpdatingStatus(offerId);
    try {
      await updateOfferStatus(user.id, offerId, newStatus);
      toast({
        title: 'Status Updated',
        description: `Offer status changed to ${newStatus.replace('_', ' ')}`,
      });
      window.location.reload(); // Refresh to show updated status
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update offer status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filterOffers = (status?: string) => {
    if (!status) return allOffers;
    return allOffers.filter(offer => offer.status === status);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Offer Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, track, and manage job offers
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Offers ({allOffers.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({filterOffers('draft').length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({filterOffers('sent').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({filterOffers('accepted').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'draft', 'sent', 'accepted'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filterOffers(tab === 'all' ? undefined : tab).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Offers Found</h3>
                    <p className="text-muted-foreground">
                      {tab === 'all' 
                        ? 'Create an offer from a candidate profile' 
                        : `No ${tab} offers to display`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterOffers(tab === 'all' ? undefined : tab).map((offer) => (
                    <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg">{offer.job_title}</CardTitle>
                            <CardDescription>
                              {offer.department && `${offer.department} • `}
                              ${offer.salary_amount?.toLocaleString()} {offer.salary_currency}
                            </CardDescription>
                          </div>
                          {getStatusBadge(offer.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span className="font-medium">
                              {new Date(offer.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          {offer.sent_at && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sent:</span>
                              <span className="font-medium">
                                {new Date(offer.sent_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {offer.expires_at && offer.status === 'sent' && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expires:</span>
                              <span className="font-medium">
                                {new Date(offer.expires_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setViewDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          {offer.status === 'draft' && (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleStatusChange(offer.id, 'sent')}
                              disabled={updatingStatus === offer.id}
                            >
                              {updatingStatus === offer.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* View Offer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Letter - {selectedOffer?.job_title}</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedOffer.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Salary:</span>
                  <div className="mt-1 font-medium">
                    ${selectedOffer.salary_amount?.toLocaleString()} {selectedOffer.salary_currency}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <div className="mt-1 font-medium">
                    {new Date(selectedOffer.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="mt-1 font-medium">
                    {new Date(selectedOffer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Offer Letter:</span>
                <Textarea
                  value={selectedOffer.offer_letter_content}
                  readOnly
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
