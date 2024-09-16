"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { football } from "@/assets";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      title: "Easy to Use",
      description: "Intuitive interface for seamless experience",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Powerful Analytics",
      description: "Gain insights with advanced data analysis",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Secure & Reliable",
      description: "Your data is safe with our robust security measures",
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  const faqItems = [
    {
      question: "What is your platform all about?",
      answer:
        "Our platform is designed to boost productivity and streamline workflows for businesses of all sizes. We offer intuitive tools for project management, collaboration, and data analysis.",
    },
    {
      question: "How much does it cost?",
      answer:
        "We offer flexible pricing plans to suit different needs. Our basic plan starts at $9.99/month, with more advanced features available in our premium tiers. Check out our pricing page for more details.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes! We offer a 14-day free trial for all new users. This gives you full access to our platform so you can experience its benefits firsthand before committing.",
    },
    {
      question: "How secure is my data?",
      answer:
        "Security is our top priority. We use industry-standard encryption protocols and regularly perform security audits. Your data is stored in secure, redundant servers to ensure both safety and availability.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary to-primary-foreground">
        <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center">
          <motion.div
            className="text-center lg:text-left lg:w-1/2 text-white mb-10 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Our Platform
            </h1>
            <p className="text-xl mb-8">
              Discover amazing features and boost your productivity
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-xs bg-white/10 border-white/20 text-white placeholder:text-white/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="transition-transform hover:scale-105 bg-white text-primary hover:bg-white/90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </Button>
            </div>
          </motion.div>
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src={football}
              alt="Hero image"
              width={800}
              height={600}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Our Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 className="text-3xl font-bold mb-4" {...fadeInUp}>
            Ready to Get Started?
          </motion.h2>
          <motion.p className="mb-8 max-w-2xl mx-auto" {...fadeInUp}>
            Join thousands of satisfied users and take your productivity to the
            next level.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="secondary"
              size="lg"
              className="group transition-all duration-300 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "John Doe",
                role: "CEO",
                content:
                  "This platform has revolutionized our workflow. Highly recommended!",
              },
              {
                name: "Jane Smith",
                role: "Designer",
                content:
                  "The intuitive interface and powerful features make my job so much easier.",
              },
              {
                name: "Mike Johnson",
                role: "Developer",
                content:
                  "I've tried many solutions, but this one stands out for its reliability and performance.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="text-yellow-400 mr-1 transition-all duration-300 ease-in-out hover:scale-110"
                        />
                      ))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{testimonial.content}</p>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact/Support Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Get in Touch
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-4">
                Contact Information
              </h3>
              <div className="flex items-center space-x-3">
                <Mail className="text-primary" />
                <span>support@ourplatform.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="text-primary" />
                <span>Live chat available 24/7</span>
              </div>
            </motion.div>
            <motion.form
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Your Message" rows={4} />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
