import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner'; // Import toast for notifications

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    setError, // Get setError
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      // Real API call
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle failure (e.g., email not found)
        const message = responseData.message || 'Could not send reset link. Please try again.';
        toast.error(message);
        setError('email', { type: 'manual', message: ' ' });
         setError('root.serverError', { type: 'manual', message });
        return;
      }

      // Handle success
      console.log('Forgot password request successful:', responseData);
      toast.success('Password reset link sent to your email!');
      setEmailSent(true);

    } catch (error) {
      // Handle network or server connection errors
      console.error('Forgot password error:', error);
      toast.error('Request failed. Could not connect to the server.');
      setError('root.serverError', {
        type: 'manual',
        message: 'Could not connect to the server. Please try again later.',
      });
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="space-y-4 text-center pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto"
          >
            <Mail className="text-white h-8 w-8" />
          </motion.div>
          <CardTitle className="text-3xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-lg">
            We've sent a password reset link to your email address. 
            Click the link in the email to reset your password.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Try again
            </Button>
          </div>
          
          <div className="pt-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur">
      <CardHeader className="space-y-4 text-center pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto"
        >
          <Mail className="text-white h-8 w-8" />
        </motion.div>
        <CardTitle className="text-3xl font-bold">Forgot your password?</CardTitle>
        <CardDescription className="text-lg">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@student.edu"
                className="pl-10 h-12"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
          {errors.root?.serverError && (
             <p className="text-sm text-destructive text-center">{errors.root.serverError.message}</p>
          )}
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Remember your password?
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordPage;