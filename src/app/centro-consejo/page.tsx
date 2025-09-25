'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useResponsiveMode } from '@/lib/hooks/useDesktopToggle';
import { typography, layout } from '@/lib/responsive-utils';
import { motion, AnimatePresence, Variants } from 'motion/react';
import Header from '@/components/layout/Header';
import { FixedBackgroundLayout } from '@/components/layout/FixedBackgroundLayout';

import {
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Calendar,
  MessageCircle,
  Award,
  BookOpen,
  UsersRound,
  Handshake,
  Phone,
  Mail,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedSignupForm } from '@/components/UnifiedSignupForm';
import { useDivineParsing } from '@/components/language/useDivineLanguage';

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Testimonial avatars mapping
const testimonialAvatars = {
  'maria_gonzalez': '👩‍👧',
  'carlos_rodriguez': '👨‍👦',
  'ana_silva': '👩‍👧‍👦',
  'pedro_morales': '👨‍👧',
  'isabel_fernandez': '👩‍👦',
  'roberto_jimenez': '👨‍👧‍👦',
  'carmen_vega': '👩‍👧‍👧',
  'miguel_torres': '👨‍👦‍👦',
  'patricia_lopez': '👩‍👧‍👦',
  'francisco_herrera': '👨‍👧',
  'sofia_mendoza': '👩‍👦',
  'diego_castro': '👨‍👧‍👦',
  'valentina_ruiz': '👩‍👧‍👧',
  'andres_moreno': '👨‍👦‍👦',
  'daniela_paredes': '👩‍👧‍👦',
};

export default function CentroConsejoPage() {
  const { t } = useDivineParsing(['common']);
  const { isDesktopForced } = useResponsiveMode();
  const [mounted, setMounted] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const features = [
    {
      icon: UsersRound,
      title: t('centro_consejo.feature_community', 'common'),
      description: t('centro_consejo.feature_community_desc', 'common'),
      color: 'text-blue-600',
    },
    {
      icon: Shield,
      title: t('centro_consejo.feature_transparency', 'common'),
      description: t('centro_consejo.feature_transparency_desc', 'common'),
      color: 'text-green-600',
    },
    {
      icon: BookOpen,
      title: t('centro_consejo.feature_resources', 'common'),
      description: t('centro_consejo.feature_resources_desc', 'common'),
      color: 'text-purple-600',
    },
    {
      icon: Handshake,
      title: t('centro_consejo.feature_support', 'common'),
      description: t('centro_consejo.feature_support_desc', 'common'),
      color: 'text-pink-600',
    },
    {
      icon: Calendar,
      title: t('centro_consejo.feature_participation', 'common'),
      description: t('centro_consejo.feature_participation_desc', 'common'),
      color: 'text-orange-600',
    },
    {
      icon: Award,
      title: t('centro_consejo.feature_recognition', 'common'),
      description: t('centro_consejo.feature_recognition_desc', 'common'),
      color: 'text-indigo-600',
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate testimonials every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex(prev => {
        const nextIndex = prev + 3;
        const testimonials = getTestimonials();
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Get testimonials from translations
  const getTestimonials = () => {
    const testimonialKeys = [
      'maria_gonzalez', 'carlos_rodriguez', 'ana_silva', 'pedro_morales',
      'isabel_fernandez', 'roberto_jimenez', 'carmen_vega', 'miguel_torres',
      'patricia_lopez', 'francisco_herrera', 'sofia_mendoza', 'diego_castro',
      'valentina_ruiz', 'andres_moreno', 'daniela_paredes'
    ];
    
    return testimonialKeys.map(key => ({
      id: key,
      name: t(`centro_consejo.testimonials.${key}.name`, 'common'),
      role: t(`centro_consejo.testimonials.${key}.role`, 'common'),
      content: t(`centro_consejo.testimonials.${key}.content`, 'common'),
      avatar: testimonialAvatars[key as keyof typeof testimonialAvatars] || '👤'
    }));
  };

  // Get current 3 testimonials to display
  const getCurrentTestimonials = () => {
    const testimonials = getTestimonials();
    const indices = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonialIndex + i) % testimonials.length;
      indices.push(index);
    }
    return indices.map(index => testimonials[index]);
  };

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg3.jpg"
      overlayType="gradient"
      responsivePositioning="default"
      pageTransitionProps={{
        skeletonType: 'centro-consejo',
        duration: 700,
        enableProgressiveAnimation: true,
      }}
    >
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="max-w-4xl mx-auto"
            >
              <motion.h1
                variants={fadeInUp}
                className={`${typography.heading(isDesktopForced)} font-bold text-white mb-6 transition-all duration-700 ease-out ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                {t('centro_consejo.title', 'common')}
              </motion.h1>

              {/* Signup Form Section */}
              <motion.div
                variants={fadeInUp}
                className={`mt-8 transition-all duration-700 ease-out delay-400 ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div
                  className={`grid ${isDesktopForced ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'} gap-6 items-start`}
                >
                  {/* Unified Signup Form - Left Column (2/3 width) */}
                  <div
                    className={`${isDesktopForced ? 'col-span-2' : 'col-span-1 lg:col-span-2'}`}
                  >
                    <UnifiedSignupForm />
                  </div>

                  {/* Testimonials - Right Column (1/3 width) */}
                  <div
                    className={`${isDesktopForced ? 'col-span-1' : 'col-span-1 lg:col-span-1'}`}
                  >
                    {/* Fixed height testimonials container matching form height */}
                    <div className="relative mt-8 mb-8">
                      <AnimatePresence mode="wait">
                        <div className="flex flex-col gap-2.5 h-full">
                          {getCurrentTestimonials().map(
                            (testimonial, index) => (
                              <motion.div
                                key={`${testimonial.id}-${currentTestimonialIndex}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                  duration: 0.6,
                                  ease: 'easeInOut',
                                  delay: index * 0.1,
                                }}
                                className="flex-1"
                              >
                                <Card className="bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-gray-700/50 hover:bg-gray-800/80 transition-all duration-300 h-full min-h-[160px]">
                                  <CardContent className="pt-5 pb-5 px-6 h-full flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="text-3xl">
                                        {testimonial.avatar}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-white text-lg leading-tight">
                                          {testimonial.name}
                                        </h4>
                                        <p className="text-base text-white/70">
                                          {testimonial.role}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-white/90 leading-relaxed text-lg line-clamp-4">
                                      &ldquo;{testimonial.content}&rdquo;
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )
                          )}
                        </div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`${layout.spacing.section(isDesktopForced)} transition-all duration-700 ease-out delay-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className={`${layout.container(isDesktopForced)}`}>
          <div className="text-center mb-12">
            <h2
              className={`${typography.heading(isDesktopForced)} font-bold text-white mb-4`}
            >
              {t('centro_consejo.subtitle', 'common')}
            </h2>
            <p
              className={`${typography.body(isDesktopForced)} text-white/80 max-w-2xl mx-auto`}
            >
              {t('centro_consejo.description', 'common')}
            </p>
          </div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 bg-white/20 rounded-lg ${feature.color}`}
                      >
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-white">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer with proper contrast and accessibility */}
      <footer
        className={`bg-gray-900/95 backdrop-blur-sm text-white py-12 transition-all duration-700 ease-out delay-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        role="contentinfo"
        aria-label={t('centro_consejo.footer.contact_info_aria', 'common')}
      >
        <div className={layout.container(isDesktopForced)}>
          <div
            className={
              isDesktopForced
                ? 'grid grid-cols-3 gap-8'
                : 'grid grid-cols-1 md:grid-cols-3 gap-8'
            }
          >
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">
                {t('centro_consejo.footer.title', 'common')}
              </h3>
              <p className="text-gray-300 mb-4">
                {t('centro_consejo.footer.description', 'common')}
              </p>
              <div className="space-y-2 text-gray-300">
                <p>📍 Anibal Pinto Nº 160, Los Sauces, Chile</p>
                <p>📞 (45) 278 3486</p>
                <p>✉️ centrodepadres@manitospintadas.cl</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {t('centro_consejo.footer.quick_access', 'common')}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/centro-consejo/dashboard"
                    className="text-gray-300 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                    aria-label={t('centro_consejo.footer.dashboard_aria', 'common')}
                  >
                    {t('centro_consejo.footer.dashboard_link', 'common')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/centro-consejo/profile"
                    className="text-gray-300 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                    aria-label={t('centro_consejo.footer.profile_aria', 'common')}
                  >
                    {t('centro_consejo.footer.profile_link', 'common')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {t('centro_consejo.footer.schedule_title', 'common')}
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>{t('centro_consejo.footer.meetings', 'common')}</li>
                <li>{t('centro_consejo.footer.time', 'common')}</li>
                <li>{t('centro_consejo.footer.location', 'common')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 pb-3">
              {t('centro_consejo.footer.school_info', 'common')}
            </p>
            <p className="text-gray-300 pb-3">
              {t('centro_consejo.footer.copyright', 'common').replace('{year}', new Date().getFullYear().toString())}
            </p>
            <p className="text-gray-300">
              {t('centro_consejo.footer.part_of', 'common')}{' '}
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition duration-200 underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                aria-label={t('centro_consejo.footer.home_link_aria', 'common')}
              >
                Manitos Pintadas
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </FixedBackgroundLayout>
  );
}
