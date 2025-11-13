import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPassword = () => {
  const [resetEmail, setResetEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(resetEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      
      setEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: `Check your inbox at ${resetEmail} for password reset instructions`
      });
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        toast({
          title: "User Not Found",
          description: "No account found with this email address",
          variant: "destructive"
        });
      } else if (error.code === 'auth/invalid-email') {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: "Too Many Attempts",
          description: "Please wait a few minutes before trying again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>

        <Card className="border border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-light rounded-full">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {emailSent 
                ? "Check your email for reset instructions"
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              /* Success State */
              <div className="space-y-6">
                <div className="p-4 bg-success-light border border-success rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success mb-1">Email Sent Successfully</p>
                    <p className="text-sm text-text-secondary">
                      We've sent password reset instructions to <span className="font-medium text-text-primary">{resetEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new password</li>
                    <li>Return to login page</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate("/login")}
                    className="flex-1"
                  >
                    Back to Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setResetEmail("");
                    }}
                    className="flex-1"
                  >
                    Send Again
                  </Button>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your registered email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value.toLowerCase())}
                    className="h-11"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {resetEmail && !isValidEmail(resetEmail) && (
                    <p className="text-xs text-destructive mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div className="p-3 bg-surface rounded-lg border border-border">
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Note:</span> The reset link will expire in 1 hour. If you don't receive the email within a few minutes, check your spam folder.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11"
                    disabled={isSubmitting || !resetEmail.trim() || !isValidEmail(resetEmail)}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent inline-block"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/login")}
                    className="flex-1 h-11"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;