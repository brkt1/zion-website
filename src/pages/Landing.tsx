import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useReward } from '../contexts/RewardContext';
import { 
  FaGamepad, 
  FaQrcode, 
  FaUsers, 
  FaTrophy, 
  FaCrown, 
  FaStar,
  FaPlay,
  FaSignInAlt,
  FaUserPlus,
  FaMobile,
  FaTabletAlt,
  FaMapMarkerAlt,
  FaClock,
  FaGift
} from 'react-icons/fa';

const Landing: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const { globalLeaderboard, fetchGlobalLeaderboard } = useLeaderboard();
  const { availableRewards, fetchAvailableRewards } = useReward();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGlobalLeaderboard();
    fetchAvailableRewards();
  }, [fetchGlobalLeaderboard, fetchAvailableRewards]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPlaying = () => {
    if (user) {
      navigate('/scan');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: FaQrcode,
      title: 'QR Code Gaming',
      description: 'Scan QR codes to access games instantly at any café or event location',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaUsers,
      title: 'Multiplayer Mode',
      description: 'Create or join game rooms to play with friends and compete together',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaTrophy,
      title: 'Global Leaderboards',
      description: 'Compete on weekly, monthly, and global leaderboards for rewards',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: FaGift,
      title: 'Reward System',
      description: 'Earn points and redeem them for café rewards and global prizes',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const gameTypes = [
    {
      name: 'Emoji Game',
      description: 'Guess hidden emoji phrases and test your creativity',
      icon: '😊',
      path: '/game/emoji',
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
      name: 'Trivia Challenge',
      description: 'Test your knowledge across various categories',
      icon: '🧠',
      path: '/game/trivia',
      color: 'bg-gradient-to-br from-blue-400 to-purple-500'
    },
    {
      name: 'Truth or Dare',
      description: 'Choose between lovers or friends mode for exciting challenges',
      icon: '💕',
      path: '/game/truth-dare',
      color: 'bg-gradient-to-br from-pink-400 to-red-500'
    },
    {
      name: 'Rock Paper Scissors',
      description: 'The classic game with modern twists and rewards',
      icon: '✂️',
      path: '/game/rock-paper-scissors',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600'
    }
  ];

  const gameModes = [
    {
      title: 'Normal Mode',
      description: 'Daily gaming at cafés with QR code access',
      features: [
        'Play on your own phone',
        'Scan QR codes at cafés',
        'Earn points and rewards',
        'Compete on leaderboards'
      ],
      icon: FaMobile,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Game Night Mode',
      description: 'Special events with tablet stations and global competition',
      features: [
        'Tablet-based gaming stations',
        'Location-specific events',
        'Global event leaderboards',
        'Special event rewards'
      ],
      icon: FaTabletAlt,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-black-primary text-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-primary filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-secondary filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500 filter blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
              <FaGamepad className="text-black-primary text-xl" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
              Yenege
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 text-gray-light hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to="/scan"
                  className="px-6 py-2 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                >
                  Start Playing
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                Yenege
              </span>
              <br />
              <span className="text-white">Game App</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-light mb-8 max-w-3xl mx-auto">
              Experience the future of social gaming with QR code access, multiplayer modes, 
              and a comprehensive reward system across cafés and special events.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={handleStartPlaying}
                className="px-8 py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary text-lg font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 transform hover:scale-105"
              >
                <FaPlay className="inline mr-2" />
                Start Playing Now
              </button>
              
              <Link
                to="/leaderboard"
                className="px-8 py-4 border-2 border-gold-primary text-gold-primary text-lg font-bold rounded-lg hover:bg-gold-primary hover:text-black-primary transition-all duration-200"
              >
                <FaTrophy className="inline mr-2" />
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-gold-primary">Yenege</span>?
            </h2>
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with social gaming to create 
              an unparalleled entertainment experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Types Section */}
      <section className="relative z-10 px-6 py-20 bg-black-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Available <span className="text-gold-primary">Games</span>
            </h2>
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              Choose from our diverse collection of games, each offering unique challenges 
              and opportunities to earn points.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameTypes.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Link to={game.path}>
                  <div className={`${game.color} p-8 rounded-2xl text-center transform group-hover:scale-105 transition-all duration-200`}>
                    <div className="text-6xl mb-4">{game.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-white/80 text-sm">{game.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Two <span className="text-gold-primary">Gaming Modes</span>
            </h2>
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              Whether you're at a café or attending a special event, 
              we have the perfect gaming experience for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {gameModes.map((mode, index) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className={`absolute top-0 left-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                  <mode.icon className="text-3xl text-white" />
                </div>
                
                <div className="ml-24">
                  <h3 className="text-2xl font-bold mb-4">{mode.title}</h3>
                  <p className="text-gray-light mb-6">{mode.description}</p>
                  
                  <ul className="space-y-3">
                    {mode.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-light">
                        <FaStar className="text-gold-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="relative z-10 px-6 py-20 bg-black-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Global <span className="text-gold-primary">Leaderboard</span>
            </h2>
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              See who's dominating the leaderboards and compete for the top spots.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-black-primary rounded-2xl p-8">
              <div className="space-y-4">
                {globalLeaderboard.slice(0, 5).map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-4 bg-gray-dark rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black-primary' :
                        index === 1 ? 'bg-gray-400 text-black-primary' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-3">
                        {player.avatar_url && (
                          <img 
                            src={player.avatar_url} 
                            alt={player.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium">{player.username}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-primary font-bold">{player.points} pts</div>
                      <div className="text-sm text-gray-light">{player.games_played} games</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                >
                  <FaTrophy className="mr-2" />
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-gold-primary">Start Gaming</span>?
            </h2>
            <p className="text-xl text-gray-light mb-8">
              Join thousands of players already enjoying the Yenege gaming experience.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={handleStartPlaying}
                className="px-8 py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary text-lg font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 transform hover:scale-105"
              >
                <FaPlay className="inline mr-2" />
                Get Started Now
              </button>
              
              <Link
                to="/leaderboard"
                className="px-8 py-4 border-2 border-gold-primary text-gold-primary text-lg font-bold rounded-lg hover:bg-gold-primary hover:text-black-primary transition-all duration-200"
              >
                <FaTrophy className="inline mr-2" />
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-black-secondary border-t border-gray-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                  <FaGamepad className="text-black-primary text-xl" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                  Yenege
                </span>
              </div>
              <p className="text-gray-light">
                The future of social gaming is here. Join the revolution.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Games</h4>
              <ul className="space-y-2 text-gray-light">
                <li><Link to="/game/emoji" className="hover:text-white transition-colors">Emoji Game</Link></li>
                <li><Link to="/game/trivia" className="hover:text-white transition-colors">Trivia Challenge</Link></li>
                <li><Link to="/game/truth-dare" className="hover:text-white transition-colors">Truth or Dare</Link></li>
                <li><Link to="/game/rock-paper-scissors" className="hover:text-white transition-colors">Rock Paper Scissors</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-light">
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboards</Link></li>
                <li><Link to="/rewards" className="hover:text-white transition-colors">Rewards</Link></li>
                <li><Link to="/multiplayer" className="hover:text-white transition-colors">Multiplayer</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-light">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-dark mt-8 pt-8 text-center text-gray-light">
            <p>&copy; {new Date().getFullYear()} Yenege Game App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
