import { ShoppingBag, Bus, MapPin, Building2, Utensils, Landmark, Music, HeartPulse } from 'lucide-react';

interface LocationItem {
  icon: React.ReactNode;
  text: string;
  distance?: string;
}

interface LocationSection {
  title: string;
  icon: React.ReactNode;
  items: LocationItem[];
  color: string;
}

export default function AroundUs() {
  const locations: LocationSection[] = [
    {
      title: 'Shopping & Dining',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'rose',
      items: [
        { icon: <ShoppingBag className="w-5 h-5" />, text: 'Major shopping malls', distance: '5 min walk' },
        { icon: <Utensils className="w-5 h-5" />, text: 'Local restaurants & cafes', distance: '2 min walk' },
        { icon: <Building2 className="w-5 h-5" />, text: 'Street markets', distance: '10 min walk' },
      ],
    },
    {
      title: 'Transportation',
      icon: <Bus className="w-6 h-6" />,
      color: 'sky',
      items: [
        { icon: <Bus className="w-5 h-5" />, text: 'Bus terminal', distance: '3 min walk' },
        { icon: <MapPin className="w-5 h-5" />, text: 'Major highways access', distance: '5 min drive' },
        { icon: <Building2 className="w-5 h-5" />, text: 'Airport shuttle service', distance: 'Available' },
      ],
    },
    {
      title: 'Attractions',
      icon: <Landmark className="w-6 h-6" />,
      color: 'amber',
      items: [
        { icon: <Landmark className="w-5 h-5" />, text: 'Historical monuments', distance: '15 min drive' },
        { icon: <Music className="w-5 h-5" />, text: 'Entertainment venues', distance: '10 min drive' },
        { icon: <MapPin className="w-5 h-5" />, text: 'City parks & gardens', distance: '8 min walk' },
      ],
    },
    {
      title: 'Essential Services',
      icon: <HeartPulse className="w-6 h-6" />,
      color: 'teal',
      items: [
        { icon: <HeartPulse className="w-5 h-5" />, text: 'Medical facilities', distance: '5 min drive' },
        { icon: <Building2 className="w-5 h-5" />, text: 'Business districts', distance: '12 min drive' },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; iconBg: string; border: string; badge: string } } = {
      rose: {
        bg: 'bg-rose-50/50',
        text: 'text-rose-700',
        iconBg: 'bg-rose-100',
        border: 'hover:border-rose-200',
        badge: 'bg-rose-600',
      },
      sky: {
        bg: 'bg-sky-50/50',
        text: 'text-sky-700',
        iconBg: 'bg-sky-100',
        border: 'hover:border-sky-200',
        badge: 'bg-sky-600',
      },
      amber: {
        bg: 'bg-amber-50/50',
        text: 'text-amber-700',
        iconBg: 'bg-amber-100',
        border: 'hover:border-amber-200',
        badge: 'bg-amber-600',
      },
      teal: {
        bg: 'bg-teal-50/50',
        text: 'text-teal-700',
        iconBg: 'bg-teal-100',
        border: 'hover:border-teal-200',
        badge: 'bg-teal-600',
      },
    };
    return colors[color];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Around Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Hotel Green Garden is conveniently located in the heart of the capital city with easy access to shopping, dining, transportation, and major attractions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {locations.map((section, index) => {
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
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="text-gray-700 font-medium text-lg">
                          {item.text}
                        </span>
                        {item.distance && (
                          <span className="text-gray-500 text-sm font-medium whitespace-nowrap">
                            {item.distance}
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

      <div className="mt-16 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-8 text-center shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Prime Location in the Capital
        </h3>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-6">
          Everything you need is just minutes away. From vibrant shopping districts to essential services,
          Hotel Green Garden puts you at the center of it all.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-rose-200">
            <span className="text-rose-700 font-semibold">Central Location</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-sky-200">
            <span className="text-sky-700 font-semibold">Easy Access</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-amber-200">
            <span className="text-amber-700 font-semibold">City Convenience</span>
          </div>
        </div>
      </div>
    </div>
  );
}
