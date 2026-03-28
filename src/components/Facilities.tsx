import { Wifi, Wind, Clock, TreePine, Utensils, Coffee, BedDouble, Car, MapPin, Sparkles } from 'lucide-react';

interface FacilityItem {
  icon: React.ReactNode;
  text: string;
  featured?: boolean;
}

interface FacilitySection {
  title: string;
  icon: React.ReactNode;
  items: FacilityItem[];
  color: string;
}

export default function Facilities() {
  const facilities: FacilitySection[] = [
    {
      title: 'Garden & Outdoor',
      icon: <TreePine className="w-6 h-6" />,
      color: 'emerald',
      items: [
        { icon: <TreePine className="w-5 h-5" />, text: 'Beautiful landscaped gardens' },
        { icon: <Sparkles className="w-5 h-5" />, text: 'Outdoor seating areas' },
        { icon: <MapPin className="w-5 h-5" />, text: 'Walking paths' },
      ],
    },
    {
      title: 'Dining',
      icon: <Utensils className="w-6 h-6" />,
      color: 'orange',
      items: [
        { icon: <Utensils className="w-5 h-5" />, text: 'On-site restaurant' },
        { icon: <Coffee className="w-5 h-5" />, text: 'Complimentary breakfast', featured: true },
        { icon: <BedDouble className="w-5 h-5" />, text: 'Room service available' },
      ],
    },
    {
      title: 'Amenities',
      icon: <Wifi className="w-6 h-6" />,
      color: 'blue',
      items: [
        { icon: <Wifi className="w-5 h-5" />, text: 'Free high-speed WiFi', featured: true },
        { icon: <Wind className="w-5 h-5" />, text: 'Air conditioning' },
        { icon: <Clock className="w-5 h-5" />, text: '24/7 front desk' },
      ],
    },
    {
      title: 'Parking & Access',
      icon: <Car className="w-6 h-6" />,
      color: 'slate',
      items: [
        { icon: <Car className="w-5 h-5" />, text: 'Free parking', featured: true },
        { icon: <MapPin className="w-5 h-5" />, text: 'Easy city access' },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; iconBg: string; border: string; badge: string } } = {
      emerald: {
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        border: 'hover:border-emerald-200',
        badge: 'bg-emerald-600',
      },
      orange: {
        bg: 'bg-orange-50/50',
        text: 'text-orange-700',
        iconBg: 'bg-orange-100',
        border: 'hover:border-orange-200',
        badge: 'bg-orange-600',
      },
      blue: {
        bg: 'bg-blue-50/50',
        text: 'text-blue-700',
        iconBg: 'bg-blue-100',
        border: 'hover:border-blue-200',
        badge: 'bg-blue-600',
      },
      slate: {
        bg: 'bg-slate-50/50',
        text: 'text-slate-700',
        iconBg: 'bg-slate-100',
        border: 'hover:border-slate-200',
        badge: 'bg-slate-600',
      },
    };
    return colors[color];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Our Facilities</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Hotel Green Garden offers a wide range of facilities to make your stay comfortable and memorable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {facilities.map((section, index) => {
          const colorClasses = getColorClasses(section.color);
          return (
            <div
              key={index}
              className={`${colorClasses.bg} bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-250 hover:-translate-y-1 ${colorClasses.border}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`${colorClasses.iconBg} ${colorClasses.text} p-3 rounded-xl`}>
                  {section.icon}
                </div>
                <h2 className={`text-2xl font-bold ${colorClasses.text}`}>
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="relative">
                    <div className="flex items-start gap-3 group">
                      <div className={`${colorClasses.text} mt-0.5 transition-transform duration-200 group-hover:scale-110`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-lg">
                          {item.text}
                        </span>
                        {item.featured && (
                          <span className={`${colorClasses.badge} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    {itemIndex < section.items.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 text-center shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Experience Premium Hospitality
        </h3>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-6">
          Every facility is designed with your comfort in mind. From our beautiful gardens to modern amenities,
          we ensure your stay is nothing short of exceptional.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-200">
            <span className="text-emerald-700 font-semibold">Premium Quality</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
            <span className="text-blue-700 font-semibold">24/7 Service</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-orange-200">
            <span className="text-orange-700 font-semibold">Guest Satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
