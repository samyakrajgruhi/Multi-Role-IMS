import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BeneficiaryRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    requestedAmount: "",
    contactNumber: "",
  });
  const [document, setDocument] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setDocument(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a request",
        variant: "destructive",
      });
      return;
    }

    if (!document) {
      toast({
        title: "Document required",
        description: "Please upload a supporting document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload document to Firebase Storage
      const storage = getStorage();
      const fileExtension = document.name.split('.').pop();
      const fileName = `beneficiary_docs/${user.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, document);
      const documentUrl = await getDownloadURL(storageRef);

      // Create request in Firestore
      await addDoc(collection(firestore, "beneficiary_requests"), {
        userId: user.uid,
        userName: user.name,
        cmsId: user.cmsId,
        sfaId: user.sfaId,
        lobby: user.lobby,
        email: user.email,
        reason: formData.reason,
        description: formData.description,
        requestedAmount: parseFloat(formData.requestedAmount),
        contactNumber: formData.contactNumber,
        documentUrl,
        documentName: document.name,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Request submitted successfully",
        description: "Your beneficiary request has been submitted for review",
      });

      // Reset form
      setFormData({
        reason: "",
        description: "",
        requestedAmount: "",
        contactNumber: "",
      });
      setDocument(null);
      
      navigate("/user-info");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Submission failed",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Request Beneficiary Assistance</CardTitle>
            <CardDescription>
              Fill out this form to request financial assistance. All requests are reviewed by administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Assistance *</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Medical Emergency, Education, etc."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your situation and why you need assistance"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Requested Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount in rupees"
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                  required
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Supporting Document *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="document"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload medical reports, bills, or other relevant documents (Max 5MB)
                </p>
                {document && (
                  <p className="text-sm text-green-600">
                    Selected: {document.name}
                  </p>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> All requests are carefully reviewed by administrators. 
                  Please ensure all information is accurate and supporting documents are valid.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
