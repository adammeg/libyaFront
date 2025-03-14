import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const newsArticles = [
  {
    id: 1,
    title: "New Import Regulations for Luxury Vehicles in Libya",
    description: "The Libyan government announces changes to import policies affecting high-end car markets.",
    image: "/placeholder.svg?height=200&width=400",
    date: "2025-02-15",
  },
  {
    id: 2,
    title: "Electric Vehicle Charging Stations Planned for Major Cities",
    description: "Initiative to install EV charging infrastructure in Tripoli, Benghazi, and Misrata gains momentum.",
    image: "/placeholder.svg?height=200&width=400",
    date: "2025-02-10",
  },
  {
    id: 3,
    title: "Local Automotive Manufacturing Plant Breaks Ground",
    description: "A new factory aimed at boosting domestic car production opens its doors in Zawiya.",
    image: "/placeholder.svg?height=200&width=400",
    date: "2025-02-05",
  },
]

export function NewsList() {
  return (
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">{article.title}</CardTitle>
              <p className="text-muted-foreground mb-4">{article.description}</p>
              <p className="text-sm text-muted-foreground">{new Date(article.date).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

