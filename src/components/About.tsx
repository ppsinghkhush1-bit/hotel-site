import { Leaf, Award, Users, Heart, Clock, Shield } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Green Paradise',
      description: 'Surrounded by lush gardens and natural beauty, creating a serene escape in the heart of the city.',
      color: 'emerald',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Premium Quality',
      description: 'Exceptional hospitality standards with attention to every detail for an unforgettable experience.',
      color: 'amber',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Professional Service',
      description: 'Dedicated team committed to making your stay comfortable and memorable.',
      color: 'sky',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Guest-Focused',
      description: 'Your comfort and satisfaction are our top priorities, every moment of your stay.',
      color: 'rose',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Convenient Location',
      description: 'Perfect blend of tranquility and accessibility in the capital city.',
      color: 'violet',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safe & Secure',
      description: 'Modern safety measures and secure environment for peace of mind.',
      color: 'slate',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; iconBg: string; border: string } } = {
      emerald: {
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        border: 'hover:border-emerald-200',
      },
      amber: {
        bg: 'bg-amber-50/50',
        text: 'text-amber-700',
        iconBg: 'bg-amber-100',
        border: 'hover:border-amber-200',
      },
      sky: {
        bg: 'bg-sky-50/50',
        text: 'text-sky-700',
        iconBg: 'bg-sky-100',
        border: 'hover:border-sky-200',
      },
      rose: {
        bg: 'bg-rose-50/50',
        text: 'text-rose-700',
        iconBg: 'bg-rose-100',
        border: 'hover:border-rose-200',
      },
      violet: {
        bg: 'bg-violet-50/50',
        text: 'text-violet-700',
        iconBg: 'bg-violet-100',
        border: 'hover:border-violet-200',
      },
      slate: {
        bg: 'bg-slate-50/50',
        text: 'text-slate-700',
        iconBg: 'bg-slate-100',
        border: 'hover:border-slate-200',
      },
    };
    return colors[color];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">About Hotel Green Garden</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your serene escape in the heart of the capital city, where nature meets modern luxury
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-2xl p-8 md:p-12 mb-12 shadow-sm border border-emerald-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Welcome to Hotel Green Garden, your serene escape in the heart of the capital city.
              We are dedicated to providing exceptional hospitality experiences in our beautiful green paradise.
            </p>
            <p>
              Surrounded by lush gardens and modern amenities, we ensure that every stay is memorable.
              Our property features comfortable accommodations, stunning garden views, and impeccable service.
            </p>
            <p>
              Whether you're traveling for business or leisure, Hotel Green Garden offers the perfect blend of
              comfort, nature, and convenience. Experience tranquility and hospitality at its finest.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`${colorClasses.bg} bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-250 hover:-translate-y-1 ${colorClasses.border}`}
              >
                <div className={`${colorClasses.iconBg} ${colorClasses.text} p-3 rounded-xl w-fit mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${colorClasses.text} mb-3`}>
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-2xl p-8 md:p-12 text-white text-center shadow-xl">
        <h3 className="text-3xl font-bold mb-4">
          Experience the Difference
        </h3>
        <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-6">
          At Hotel Green Garden, we don't just provide rooms – we create experiences.
          From our verdant gardens to our attentive service, every aspect is designed to make your stay exceptional.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-300 mb-2">50+</div>
            <div className="text-emerald-100">Comfortable Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-300 mb-2">10+</div>
            <div className="text-emerald-100">Years of Service</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-300 mb-2">1000+</div>
            <div className="text-emerald-100">Happy Guests</div>
          </div>
        </div>
      </div>
    </div>
  );
}
