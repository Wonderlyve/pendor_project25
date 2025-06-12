
import { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

const HelpSupport = () => {
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Comment créer un pronostic ?",
      answer: "Pour créer un pronostic, cliquez sur le bouton '+' en bas de l'écran, remplissez les informations du match, votre analyse et votre niveau de confiance."
    },
    {
      question: "Comment suivre un pronostiqueur ?",
      answer: "Allez sur le profil du pronostiqueur et cliquez sur 'Suivre'. Vous recevrez des notifications pour ses nouveaux pronostics."
    },
    {
      question: "Qu'est-ce qu'un canal VIP ?",
      answer: "Les canaux VIP sont des espaces privés créés par des pronostiqueurs certifiés où ils partagent des analyses exclusives contre un abonnement."
    },
    {
      question: "Comment devenir pronostiqueur certifié ?",
      answer: "Pour être certifié, vous devez avoir un historique de pronostics positifs et faire une demande via notre formulaire de candidature."
    },
    {
      question: "Comment signaler un contenu inapproprié ?",
      answer: "Utilisez le menu (⋯) sur le post concerné et sélectionnez 'Signaler'. Notre équipe examinera le contenu rapidement."
    },
    {
      question: "Comment modifier mon profil ?",
      answer: "Allez dans 'Profil' puis cliquez sur 'Modifier le profil' pour changer votre photo, nom d'utilisateur et bio."
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Discutez avec notre équipe support",
      action: "Démarrer une conversation"
    },
    {
      icon: Mail,
      title: "Email",
      description: "support@pendor.app",
      action: "Envoyer un email"
    },
    {
      icon: Phone,
      title: "Téléphone",
      description: "+33 1 23 45 67 89",
      action: "Appeler"
    }
  ];

  const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Ici vous pourriez envoyer le message à votre système de support
    toast.success('Votre message a été envoyé. Notre équipe vous répondra sous 24h.');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Aide & Support</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Quick Actions */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Contact rapide</h2>
          <div className="grid gap-3">
            {contactOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <option.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{option.title}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {option.action}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Questions fréquentes</h2>
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <Collapsible key={index} open={openFaq === index} onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="font-medium">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <p className="text-gray-600 text-sm">{item.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Nous contacter</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sujet</label>
              <Input
                placeholder="Décrivez brièvement votre problème"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Décrivez votre problème en détail..."
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <Button onClick={handleSubmitContact} className="w-full">
              Envoyer le message
            </Button>
          </div>
        </Card>

        {/* Resources */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4">Ressources utiles</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Guide d'utilisation</p>
                <p className="text-sm text-gray-500">Apprenez à utiliser toutes les fonctionnalités</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Conditions d'utilisation</p>
                <p className="text-sm text-gray-500">Consultez nos conditions d'utilisation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Politique de confidentialité</p>
                <p className="text-sm text-gray-500">Comment nous protégeons vos données</p>
              </div>
            </div>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-4 text-center">
          <h3 className="font-semibold mb-2">PENDOR</h3>
          <p className="text-sm text-gray-500 mb-2">
            L'application de pronostics sportifs de référence
          </p>
          <p className="text-xs text-gray-400">
            Version 1.0.0 • Build 2024.06.11
          </p>
        </Card>
      </div>
    </div>
  );
};

export default HelpSupport;
