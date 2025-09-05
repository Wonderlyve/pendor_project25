import { SmartFeedContainer } from '@/components/classement/SmartFeedContainer';
import Navbar from '@/components/Navbar';

const SmartFeed = () => {
  return (
    <>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Feed Intelligent
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez les meilleurs pronostics grâce à notre algorithme de classement avancé. 
                Basé sur la qualité du contenu, l'engagement, la fiabilité des auteurs et la fraîcheur des pronos.
              </p>
            </div>

            <SmartFeedContainer />
          </div>
        </main>
      </div>
    </>
  );
};

export default SmartFeed;