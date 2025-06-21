import type { Itinerary } from "./types"

export const mockItinerary: Itinerary = {
  id: "paris-3days-art-food",
  destination: "Paris, France",
  duration: "3 days",
  budget: "Medium",
  interests: ["Art", "Food"],
  totalPrice: 485,
  currency: "EUR",
  days: [
    {
      day: 1,
      date: "2024-03-15",
      dailyTotal: 165,
      activities: [
        {
          time: "9:00 AM",
          title: "Louvre Museum",
          description:
            "Start your art journey at the world's largest art museum. Don't miss the Mona Lisa and Venus de Milo.",
          location: "Rue de Rivoli, 75001 Paris",
          price: 17,
        },
        {
          time: "1:00 PM",
          title: "Lunch at Café Marly",
          description: "Elegant dining inside the Louvre with French cuisine and museum views.",
          location: "Inside Louvre Museum",
          price: 45,
        },
        {
          time: "3:00 PM",
          title: "Tuileries Garden Walk",
          description: "Stroll through the beautiful gardens and enjoy street art performances.",
          location: "Place de la Concorde, 75001 Paris",
          price: 0,
        },
        {
          time: "6:00 PM",
          title: "Seine River Cruise",
          description: "Romantic evening cruise with dinner and views of illuminated landmarks.",
          location: "Port de la Bourdonnais",
          price: 103,
        },
      ],
    },
    {
      day: 2,
      date: "2024-03-16",
      dailyTotal: 155,
      activities: [
        {
          time: "10:00 AM",
          title: "Musée d'Orsay",
          description: "Explore the world's finest collection of Impressionist masterpieces.",
          location: "1 Rue de la Légion d'Honneur, 75007 Paris",
          price: 16,
        },
        {
          time: "1:30 PM",
          title: "Le Comptoir du Relais",
          description: "Authentic bistro experience with traditional French dishes.",
          location: "9 Carrefour de l'Odéon, 75006 Paris",
          price: 38,
        },
        {
          time: "3:30 PM",
          title: "Montmartre & Sacré-Cœur",
          description: "Explore the artistic quarter and visit the iconic basilica.",
          location: "Montmartre, 75018 Paris",
          price: 0,
        },
        {
          time: "7:00 PM",
          title: "Wine Tasting in Montmartre",
          description: "Sample local wines at a cozy wine bar with panoramic city views.",
          location: "Place du Tertre, Montmartre",
          price: 101,
        },
      ],
    },
    {
      day: 3,
      date: "2024-03-17",
      dailyTotal: 165,
      activities: [
        {
          time: "9:30 AM",
          title: "Marché des Enfants Rouges",
          description: "Paris's oldest covered market - perfect for food lovers and local culture.",
          location: "39 Rue de Bretagne, 75003 Paris",
          price: 15,
        },
        {
          time: "11:30 AM",
          title: "Le Marais District Walk",
          description: "Explore historic Jewish quarter with art galleries and boutique shops.",
          location: "Le Marais, 75004 Paris",
          price: 0,
        },
        {
          time: "2:00 PM",
          title: "L'As du Fallafel",
          description: "Famous falafel spot in the heart of Le Marais - a local favorite.",
          location: "34 Rue des Rosiers, 75004 Paris",
          price: 8,
        },
        {
          time: "4:00 PM",
          title: "Centre Pompidou",
          description: "Modern art museum with contemporary masterpieces and city views.",
          location: "Place Georges-Pompidou, 75004 Paris",
          price: 16,
        },
        {
          time: "7:30 PM",
          title: "Farewell Dinner at Le Train Bleu",
          description: "Elegant Belle Époque restaurant in Gare de Lyon for a memorable final meal.",
          location: "Gare de Lyon, 75012 Paris",
          price: 126,
        },
      ],
    },
  ],
}
