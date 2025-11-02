import { ArrowLeft, Coffee, Code, Bug, Heart, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Game
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Support typeracinggame.com
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us improve and maintain this typing game. Your support means the world!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Buy Me a Coffee</CardTitle>
              </div>
              <CardDescription>
                Support the development with a one-time donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your financial support helps keep the game running and allows us to add new features and improvements.
              </p>
              <Button
                onClick={() => window.open("https://buymeacoffee.com/haroldas", "_blank")}
                className="w-full"
              >
                <Heart className="mr-2 h-4 w-4" />
                Support on Buy Me a Coffee
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Contribute Code</CardTitle>
              </div>
              <CardDescription>
                Help improve the game with your coding skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Fork the repository, make improvements, and submit pull requests. All contributions are welcome!
              </p>
              <Button
                onClick={() => window.open("https://github.com/hpharis258/fast-type-arena", "_blank")}
                variant="outline"
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                View Repository
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Other Ways to Help</CardTitle>
            <CardDescription>
              Every contribution makes a difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Report Bugs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Found a bug? Help us fix it by reporting it in our GitHub issues tab. Anyone is welcome to contribute!
                </p>
                <Button
                  onClick={() => window.open("https://github.com/hpharis258/fast-type-arena/issues", "_blank")}
                  variant="outline"
                  size="sm"
                >
                  Report an Issue
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Suggest Features</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Have an idea for a new feature? Share it with us on GitHub! We love hearing your suggestions.
                </p>
                <Button
                  onClick={() => window.open("https://github.com/hpharis258/fast-type-arena/issues", "_blank")}
                  variant="outline"
                  size="sm"
                >
                  Suggest a Feature
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Share the Game</h3>
                <p className="text-sm text-muted-foreground">
                  Tell your friends about typeracinggame.com! Word of mouth is one of the best ways to support us.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for being part of our community! ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
