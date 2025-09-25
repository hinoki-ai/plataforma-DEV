'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import styles from './AnimationDemo.module.css';

export default function AnimationDemo() {
  const [activeDemo, setActiveDemo] = useState('basics');
  const [bounceHeight, setBounceHeight] = useState('20px');
  const [slideFrom, setSlideFrom] = useState('-100%');
  const [slideTo, setSlideTo] = useState('0%');
  const [scaleFrom, setScaleFrom] = useState('0.8');
  const [scaleTo, setScaleTo] = useState('1');
  const [rotateFrom, setRotateFrom] = useState('0deg');
  const [rotateTo, setRotateTo] = useState('360deg');

  // Set CSS custom properties for dynamic animations
  useEffect(() => {
    const bounceElement = document.getElementById('animate-bounce-dynamic');
    if (bounceElement) {
      setCustomProperties(bounceElement, { 'bounce-offset': bounceHeight });
    }
  }, [bounceHeight]);

  useEffect(() => {
    const slideElement = document.getElementById('animate-slide-dynamic');
    if (slideElement) {
      setCustomProperties(slideElement, {
        'slide-from': slideFrom,
        'slide-to': slideTo
      });
    }
  }, [slideFrom, slideTo]);

  useEffect(() => {
    const scaleElement = document.getElementById('animate-scale-dynamic');
    if (scaleElement) {
      setCustomProperties(scaleElement, {
        'scale-from': scaleFrom,
        'scale-to': scaleTo
      });
    }
  }, [scaleFrom, scaleTo]);

  useEffect(() => {
    const rotateElement = document.getElementById('animate-rotate-dynamic');
    if (rotateElement) {
      setCustomProperties(rotateElement, {
        'rotate-from': rotateFrom,
        'rotate-to': rotateTo
      });
    }
  }, [rotateFrom, rotateTo]);

  const setCustomProperties = (element: HTMLElement, properties: Record<string, string>) => {
    Object.entries(properties).forEach(([key, value]) => {
      element.style.setProperty(`--${key}`, value);
    });
  };

  const triggerAnimation = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Remove and re-add the class to restart animation
      element.className = element.className.replace(/animate-[^\s]+/g, '');
      setTimeout(() => {
        element.className += ` ${elementId}`;
      }, 10);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CSS Keyframe Animations Demo
          </h1>
          <p className="text-lg text-gray-600">
            Interactive showcase of advanced animation techniques from Josh Comeau&apos;s guide
          </p>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="basics">Basic Syntax</TabsTrigger>
            <TabsTrigger value="timing">Timing Functions</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
          </TabsList>

          {/* Basic Syntax Tab */}
          <TabsContent value="basics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Keyframe Syntax</CardTitle>
                <CardDescription>
                  Fundamental slide-in animations using from/to syntax
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      id="animate-slide-in"
                      className="w-20 h-20 bg-blue-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in')}
                      size="sm"
                    >
                      Slide In Left
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-slide-in-right"
                      className="w-20 h-20 bg-green-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-right')}
                      size="sm"
                    >
                      Slide In Right
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-slide-in-up"
                      className="w-20 h-20 bg-purple-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-up')}
                      size="sm"
                    >
                      Slide In Up
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-slide-in-down"
                      className="w-20 h-20 bg-pink-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-down')}
                      size="sm"
                    >
                      Slide In Down
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Looped Animations</CardTitle>
                <CardDescription>Infinite animations for loading states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-linear mx-auto mb-2"></div>
                    <Badge variant="outline">Linear Spin</Badge>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin-reverse mx-auto mb-2"></div>
                    <Badge variant="outline">Reverse Spin</Badge>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full animate-pulse-infinite mx-auto mb-2"></div>
                    <Badge variant="outline">Pulse</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Functions Tab */}
          <TabsContent value="timing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timing Functions</CardTitle>
                <CardDescription>
                  Different easing curves for various animation effects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div
                      id="animate-slide-in-ease"
                      className="w-20 h-20 bg-blue-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-ease')}
                      size="sm"
                      className="mb-2"
                    >
                      Ease
                    </Button>
                    <Badge variant="secondary">Default easing</Badge>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-slide-in-ease-in-out"
                      className="w-20 h-20 bg-green-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-ease-in-out')}
                      size="sm"
                      className="mb-2"
                    >
                      Ease In Out
                    </Button>
                    <Badge variant="secondary">Smooth start & end</Badge>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-slide-in-cubic-bezier"
                      className="w-20 h-20 bg-purple-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-in-cubic-bezier')}
                      size="sm"
                      className="mb-2"
                    >
                      Cubic Bezier
                    </Button>
                    <Badge variant="secondary">Custom bounce</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Step Animations</CardTitle>
                <CardDescription>
                  Complex sequences using percentage-based keyframes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-multi-step-spin mx-auto mb-2"></div>
                    <Badge variant="outline">Multi-Step Spin</Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Each step has its own timing function
                    </p>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-entrance-multi-step"
                      className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-entrance-multi-step')}
                      size="sm"
                      className="mb-2"
                    >
                      Multi-Step Entrance
                    </Button>
                    <Badge variant="outline">Scale + Translate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alternating Animations</CardTitle>
                <CardDescription>
                  Ping-pong effects using animation-direction: alternate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full animate-breathe mx-auto mb-2"></div>
                    <Badge variant="outline">Breathe</Badge>
                    <p className="text-sm text-gray-600 mt-2">Scale 1 → 1.1 → 1</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-lg animate-grow-and-shrink mx-auto mb-2"></div>
                    <Badge variant="outline">Grow & Shrink</Badge>
                    <p className="text-sm text-gray-600 mt-2">Scale 1 → 1.5 → 1</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500 rounded-lg animate-bounce mx-auto mb-2"></div>
                    <Badge variant="outline">Bounce</Badge>
                    <p className="text-sm text-gray-600 mt-2">Translate Y bounce</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fill Modes</CardTitle>
                <CardDescription>
                  Controlling animation persistence with forwards/backwards/both
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div
                      id="animate-fade-out"
                      className="w-20 h-20 bg-red-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-fade-out')}
                      size="sm"
                      className="mb-2"
                    >
                      Fade Out (Forwards)
                    </Button>
                    <Badge variant="outline">Persists final state</Badge>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-delayed-entrance"
                      className="w-20 h-20 bg-yellow-500 rounded-lg mx-auto mb-2 opacity-0"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-delayed-entrance')}
                      size="sm"
                      className="mb-2"
                    >
                      Delayed Entrance
                    </Button>
                    <Badge variant="outline">500ms delay + both</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School-Specific Animations</CardTitle>
                <CardDescription>
                  Custom animations designed for educational contexts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div
                      id="animate-calendar-day"
                      className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2"
                    >
                      15
                    </div>
                    <Button
                      onClick={() => triggerAnimation('animate-calendar-day')}
                      size="sm"
                      className="mb-2"
                    >
                      Calendar Day
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-bell-ring"
                      className="w-8 h-8 text-2xl mx-auto mb-2"
                    >
                      🔔
                    </div>
                    <Button
                      onClick={() => triggerAnimation('animate-bell-ring')}
                      size="sm"
                      className="mb-2"
                    >
                      Bell Ring
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-page-turn"
                      className="w-16 h-20 bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-r-lg shadow-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-page-turn')}
                      size="sm"
                      className="mb-2"
                    >
                      Page Turn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Tab */}
          <TabsContent value="dynamic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Animations with CSS Variables</CardTitle>
                <CardDescription>
                  Customizable animations using calc() and CSS custom properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bounce Animation Controls */}
                  <div className="space-y-4">
                    <Label htmlFor="bounce-height">Bounce Height</Label>
                    <Input
                      id="bounce-height"
                      value={bounceHeight}
                      onChange={(e) => setBounceHeight(e.target.value)}
                      placeholder="20px"
                    />
                    <div
                      id="animate-bounce-dynamic"
                      className={`w-16 h-16 bg-blue-500 rounded-full mx-auto ${styles.animateBounceDynamic}`}
                    ></div>
                  </div>

                  {/* Slide Animation Controls */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="slide-from">From</Label>
                        <Input
                          id="slide-from"
                          value={slideFrom}
                          onChange={(e) => setSlideFrom(e.target.value)}
                          placeholder="-100%"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slide-to">To</Label>
                        <Input
                          id="slide-to"
                          value={slideTo}
                          onChange={(e) => setSlideTo(e.target.value)}
                          placeholder="0%"
                        />
                      </div>
                    </div>
                    <div
                      id="animate-slide-dynamic"
                      className={`w-16 h-16 bg-green-500 rounded-lg mx-auto ${styles.animateSlideDynamic}`}
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-slide-dynamic')}
                      size="sm"
                      className="w-full"
                    >
                      Animate
                    </Button>
                  </div>

                  {/* Scale Animation Controls */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="scale-from">Scale From</Label>
                        <Input
                          id="scale-from"
                          value={scaleFrom}
                          onChange={(e) => setScaleFrom(e.target.value)}
                          placeholder="0.8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scale-to">Scale To</Label>
                        <Input
                          id="scale-to"
                          value={scaleTo}
                          onChange={(e) => setScaleTo(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div
                      id="animate-scale-dynamic"
                      className={`w-16 h-16 bg-purple-500 rounded-lg mx-auto ${styles.animateScaleDynamic}`}
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-scale-dynamic')}
                      size="sm"
                      className="w-full"
                    >
                      Animate
                    </Button>
                  </div>

                  {/* Rotation Animation Controls */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="rotate-from">Rotate From</Label>
                        <Input
                          id="rotate-from"
                          value={rotateFrom}
                          onChange={(e) => setRotateFrom(e.target.value)}
                          placeholder="0deg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rotate-to">Rotate To</Label>
                        <Input
                          id="rotate-to"
                          value={rotateTo}
                          onChange={(e) => setRotateTo(e.target.value)}
                          placeholder="360deg"
                        />
                      </div>
                    </div>
                    <div
                      id="animate-rotate-dynamic"
                      className={`w-16 h-16 bg-pink-500 rounded-lg mx-auto ${styles.animateRotateDynamic}`}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Animation Shorthand Examples</CardTitle>
                <CardDescription>
                  Complex animations using the animation shorthand property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div
                      id="animate-complex"
                      className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-complex')}
                      size="sm"
                      className="mb-2"
                    >
                      Complex Shorthand
                    </Button>
                    <p className="text-sm text-gray-600">
                      slide-in 1000ms cubic-bezier(...) 2s infinite alternate both
                    </p>
                  </div>

                  <div className="text-center">
                    <div
                      id="animate-delayed-complex"
                      className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mx-auto mb-2"
                    ></div>
                    <Button
                      onClick={() => triggerAnimation('animate-delayed-complex')}
                      size="sm"
                      className="mb-2"
                    >
                      Delayed Complex
                    </Button>
                    <p className="text-sm text-gray-600">
                      Separate delay property
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">About This Demo</h3>
              <p className="text-gray-600 mb-4">
                This interactive demo showcases all the keyframe animation concepts from Josh Comeau&apos;s comprehensive guide.
                Each animation demonstrates a specific technique that can be applied to your school website.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">CSS Keyframes</Badge>
                <Badge variant="outline">Timing Functions</Badge>
                <Badge variant="outline">Animation Direction</Badge>
                <Badge variant="outline">Fill Modes</Badge>
                <Badge variant="outline">CSS Variables</Badge>
                <Badge variant="outline">Accessibility</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}