import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal = ({ isOpen, onClose, message }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [signupType, setSignupType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Formulaire de connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  
  // Formulaire d'inscription
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');

  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = loginType === 'email' ? loginEmail : `${loginPhone}@pendor.com`;
    const { error } = await signIn(email, loginPassword);
    
    if (!error) {
      onClose();
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = signupType === 'email' ? signupEmail : `${signupPhone}@pendor.com`;
    const userData = {
      username: signupUsername,
      display_name: signupDisplayName,
      phone: signupType === 'phone' ? signupPhone : undefined
    };

    const { error } = await signUp(email, signupPassword, userData);
    
    if (!error) {
      setIsLogin(true);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 border-0 bg-transparent shadow-none max-h-[90vh]">
        <div className="bg-white rounded-2xl shadow-xl overflow-y-auto scrollbar-hide max-h-[90vh]">
          <div className="p-6 pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🏆</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">PENDOR</h2>
              <p className="text-gray-600 text-sm">Vos pronostics gagnants</p>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inscription
              </button>
            </div>

            {/* Content based on tab */}
            {isLogin ? (
              <>
                {/* Auth type tabs for login */}
                <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setLoginType('email')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      loginType === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('phone')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      loginType === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginType === 'email' ? (
                    <div>
                      <Label htmlFor="login-email" className="text-gray-700 font-medium">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="login-phone" className="text-gray-700 font-medium">Numéro de téléphone</Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="0123456789"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                        className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Votre numéro sera utilisé comme identifiant
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="login-password" className="text-gray-700 font-medium">Mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg mt-6"
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Auth type tabs for signup */}
                <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setSignupType('email')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      signupType === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupType('phone')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      signupType === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </button>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-username" className="text-gray-700 font-medium">Nom d'utilisateur</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="votre_pseudo"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-display-name" className="text-gray-700 font-medium">Nom d'affichage</Label>
                    <Input
                      id="signup-display-name"
                      type="text"
                      placeholder="Votre nom complet"
                      value={signupDisplayName}
                      onChange={(e) => setSignupDisplayName(e.target.value)}
                      required
                      className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {signupType === 'email' ? (
                    <div>
                      <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="signup-phone" className="text-gray-700 font-medium">Numéro de téléphone</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="0123456789"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        required
                        className="mt-1 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Votre numéro sera utilisé comme identifiant
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="signup-password" className="text-gray-700 font-medium">Mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Créer un mot de passe"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Au moins 6 caractères
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg mt-6"
                  >
                    {loading ? 'Inscription...' : "S'inscrire"}
                  </Button>
                </form>
              </>
            )}

            {/* Message */}
            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm text-center">{message}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;