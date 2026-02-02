import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  ChevronRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered exam and task scheduling that adapts to your preferences'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Optimize your study time with intelligent time slot recommendations'
    },
    {
      icon: BookOpen,
      title: 'Exam Tracking',
      description: 'Keep track of all your upcoming exams and important deadlines'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Share schedules and collaborate with classmates and instructors'
    }
  ];

  const testimonials = [
    {
      name: 'Atul Dehuri',
      role: 'Computer Science Student',
      content: 'Schedulify transformed how I manage my academic life. No more missed deadlines!',
      rating: 5
    },
    {
      name: 'Narendra Bhattacharya',
      role: 'Law Student',
      content: 'The smart scheduling feature is incredible. It actually learns my preferences.',
      rating: 5
    },
    {
      name: 'Sohan Patra',
      role: 'Business Student',
      content: 'Perfect for organizing group projects and exam preparation. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Schedulify
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
         
          <ThemeToggle />
          <Link to="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/auth/signup">
            <Button>Get Started</Button>
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Master Your Academic Schedule
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            The intelligent scheduling platform designed for students. Organize exams, manage tasks, 
            and optimize your study time with AI-powered recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Start Scheduling <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features for Students</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to stay organized and excel academically
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur rounded-3xl mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Loved by Students Everywhere</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of students who've transformed their academic lives
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg bg-white/70 backdrop-blur">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Schedule?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of students who are already using Schedulify to ace their academics.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Schedulify. Made with ❤️ for students everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;