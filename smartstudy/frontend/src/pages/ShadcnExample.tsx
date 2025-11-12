import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ShadcnExample() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          shadcn/ui Components Example
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Examples of shadcn/ui components in AceMind
        </p>
      </div>

      <div className="space-y-8">
        {/* Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              Different button styles and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Statistics</CardTitle>
              <CardDescription>Your recent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Quizzes Taken
                  </span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Average Score
                  </span>
                  <span className="font-semibold">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Study Streak
                  </span>
                  <span className="font-semibold">7 days</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Details</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Plan</CardTitle>
              <CardDescription>Your upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Biology - 2:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Math - 4:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">History - 6:00 PM</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Plan
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>Your latest study notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Photosynthesis</div>
                  <div className="text-muted-foreground text-xs">
                    2 hours ago
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Cell Division</div>
                  <div className="text-muted-foreground text-xs">
                    5 hours ago
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">DNA Structure</div>
                  <div className="text-muted-foreground text-xs">
                    1 day ago
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                View All Notes
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
            <CardDescription>
              Generate a quiz from your study material
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Quiz Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Biology Chapter 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Study Content</Label>
              <textarea
                id="content"
                placeholder="Paste your study material here..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="questions">Number of Questions</Label>
                <Input
                  id="questions"
                  type="number"
                  placeholder="10"
                  defaultValue="10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Generate Quiz</Button>
          </CardFooter>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                AI Quiz Generator
              </CardTitle>
              <CardDescription>
                Create personalized quizzes from any content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload PDFs or paste text to generate intelligent multiple-choice
                questions powered by AI.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Generating</Button>
            </CardFooter>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Study Planner
              </CardTitle>
              <CardDescription>
                AI-powered study schedule optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get a personalized study plan based on your exam date, subjects,
                and available time.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                Create Plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>🎉 shadcn/ui is Ready!</CardTitle>
            <CardDescription>
              Your project is now configured with shadcn/ui components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              You can now use beautiful, accessible components throughout your
              application. Check out the SHADCN_SETUP.md file for more
              information on adding additional components.
            </p>
            <div className="flex gap-2">
              <Button size="sm">View Documentation</Button>
              <Button size="sm" variant="outline">
                Browse Components
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
