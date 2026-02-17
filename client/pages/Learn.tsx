import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Zap, Target, Clock, BarChart3, Award } from "lucide-react";

export default function Learn() {
  const stats = [
    { label: "Lessons Completed", value: "0", icon: BookOpen },
    { label: "Current Streak", value: "0 days", icon: Zap },
    { label: "Words Learned", value: "0", icon: Target },
    { label: "Time Spent", value: "0h", icon: Clock },
  ];

  const courses = [
    {
      title: "Beginner Conversations",
      description: "Master basic greetings, introductions, and everyday phrases",
      progress: 0,
      level: "A1",
      lessons: 24,
    },
    {
      title: "Restaurant & Food",
      description: "Learn to order food and discuss cuisine with confidence",
      progress: 0,
      level: "A2",
      lessons: 18,
    },
    {
      title: "Business Communication",
      description: "Professional conversations and business etiquette",
      progress: 0,
      level: "B1",
      lessons: 32,
    },
  ];

  return (
    <Layout>
      {/* Header Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-blue-50 to-white border-b border-border">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="mb-2">Welcome back, Learner!</h1>
              <p className="text-foreground/60">Continue your Mandarin learning journey</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto">
              Start Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="container max-w-6xl mx-auto space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Courses Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Learning Paths</h2>
              <p className="text-foreground/60">
                Choose a course and start practicing with AI conversations
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {courses.map((course, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-border bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-4">
                        <span className="text-sm font-semibold text-primary">{course.level}</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {course.title}
                      </h3>
                      <p className="text-foreground/70 text-sm">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-foreground">Progress</p>
                      <p className="text-sm text-foreground/60">{course.progress}%</p>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-foreground/60">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons} lessons
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground/40">
                      {course.progress === 0 ? "Not started" : "In progress"}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    {course.progress === 0 ? "Start Course" : "Continue Learning"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>

            {/* More Courses Placeholder */}
            <div className="mt-6 p-8 rounded-2xl border-2 border-dashed border-border bg-muted/20 text-center">
              <Award className="w-8 h-8 text-foreground/40 mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-2">More courses coming soon</h4>
              <p className="text-sm text-foreground/60">
                We're constantly adding new learning paths and specialized content
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Learning Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-white">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Practice Daily</h4>
                <p className="text-sm text-foreground/60">
                  Even 15-30 minutes of daily practice builds stronger fluency than sporadic longer sessions.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-white">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Track Progress</h4>
                <p className="text-sm text-foreground/60">
                  Check your stats regularly to identify areas for improvement and celebrate your wins.
                </p>
              </div>
            </div>
          </div>

          {/* Onboarding CTA */}
          <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Ready to start learning?</h3>
            <p className="text-foreground/70 mb-6 max-w-xl mx-auto">
              Select a course above and begin your first lesson. Get feedback from AI and track your progress in real-time.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Choose Your First Course
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
