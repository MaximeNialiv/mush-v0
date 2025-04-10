"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CGUPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-mush-yellow/10">
          <CardTitle className="text-center text-2xl font-bold text-mush-green">
            Conditions Générales d'Utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Présentation de Mush</h2>
            <p>
              Mush est une plateforme sociale basée sur un système de cartes interactives permettant aux utilisateurs 
              de partager du contenu, de répondre à des quiz et d'accumuler des points.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Acceptation des conditions</h2>
            <p>
              En vous inscrivant sur Mush, vous acceptez sans réserve l'intégralité des présentes conditions générales 
              d'utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Inscription et compte utilisateur</h2>
            <p>
              Pour utiliser Mush, vous devez créer un compte en fournissant une adresse email valide et un mot de passe. 
              Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées 
              depuis votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Règles de conduite</h2>
            <p>
              En utilisant Mush, vous vous engagez à respecter les règles suivantes :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Ne pas publier de contenu illégal, diffamatoire, obscène ou offensant</li>
              <li>Ne pas usurper l'identité d'une autre personne</li>
              <li>Ne pas tenter de contourner les limitations techniques de la plateforme</li>
              <li>Ne pas utiliser la plateforme pour envoyer des messages non sollicités</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Propriété intellectuelle</h2>
            <p>
              Tout le contenu disponible sur Mush, incluant mais non limité aux textes, graphiques, logos, 
              icônes, images, clips audio, téléchargements numériques et compilations de données, est la propriété 
              de Mush ou de ses fournisseurs de contenu et est protégé par les lois françaises et internationales 
              relatives à la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Protection des données personnelles</h2>
            <p>
              Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité. 
              En utilisant Mush, vous consentez à cette collecte et à ce traitement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Communications</h2>
            <p>
              Si vous avez accepté de recevoir des communications lors de votre inscription, nous pourrons vous 
              envoyer des emails concernant votre compte, les mises à jour de la plateforme ou des offres promotionnelles. 
              Vous pouvez vous désabonner de ces communications à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Modification des CGU</h2>
            <p>
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prendront effet 
              dès leur publication sur la plateforme. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation des présentes CGU. 
              Vous pouvez également supprimer votre compte à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
            <p>
              Pour toute question concernant ces CGU, veuillez nous contacter à l'adresse suivante : contact@mush.fr
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link href="/auth/signup">
              <Button className="bg-mush-green hover:bg-mush-green/90">
                Retour à l'inscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
