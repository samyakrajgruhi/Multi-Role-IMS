import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Phone, Mail, Calendar, IndianRupee, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeneficiaryRequest {
  id: string;
  userId: string;
  userName: string;
  cmsId: string;
  sfaId: string;
  lobby: string;
  email: string;
  reason: string;
  description: string;
  requestedAmount: number;
  contactNumber: string;
  documentUrl: string;
  documentName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
}

export default function BeneficiaryManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BeneficiaryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BeneficiaryRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      const userQuery = query(collection(firestore, 'users'), where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        if (userData.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate("/user-info");
          return;
        }
      }
    };

    checkAdminStatus();

    // Subscribe to beneficiary requests
    const q = query(
      collection(firestore, "beneficiary_requests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BeneficiaryRequest[];
      setRequests(requestsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, navigate, toast]);

  const handleStatusUpdate = async (requestId: string, status: "approved" | "rejected") => {
    setIsProcessing(true);
    try {
      const requestRef = doc(firestore, "beneficiary_requests", requestId);
      await updateDoc(requestRef, {
        status,
        reviewedAt: new Date(),
        reviewedBy: user?.name,
      });

      toast({
        title: `Request ${status}`,
        description: `The beneficiary request has been ${status}`,
      });

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Update failed",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Beneficiary Request Management</h1>
          <p className="text-muted-foreground">Review and manage assistance requests from members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No beneficiary requests yet</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.userName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>SFA ID: {request.sfaId}</div>
                        <div>CMS ID: {request.cmsId}</div>
                        <div>Lobby: {request.lobby}</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-xl font-bold text-primary">
                        <IndianRupee className="h-5 w-5" />
                        {request.requestedAmount.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="font-medium">Reason: </span>
                      <span className="text-muted-foreground">{request.reason}</span>
                    </div>
                    <div>
                      <span className="font-medium">Description: </span>
                      <span className="text-muted-foreground">{request.description}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {request.contactNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {request.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documentUrl, "_blank")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(request.id, "approved")}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(request.id, "rejected")}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
