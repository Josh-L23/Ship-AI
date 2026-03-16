"use client";

import { useState } from "react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

const fadeVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

export function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <LayoutGroup>
      <div className="w-full max-w-[880px] min-h-[520px] flex flex-col md:flex-row rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20 relative">
        {/* Brand panel — slides between left and right via layout animation */}
        <motion.div
          layout
          layoutId="brand-panel"
          transition={springTransition}
          style={{ order: isLogin ? -1 : 1 }}
          className="hidden md:flex md:w-[380px] shrink-0 flex-col items-center justify-center p-10 bg-foreground/[0.03] border-border/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="brand-login"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <BrandPanel
                  heading="Welcome back"
                  subtext="Sign in to continue building extraordinary brands."
                  buttonLabel="Create an account"
                  onSwitch={() => setIsLogin(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="brand-signup"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <BrandPanel
                  heading="Join SHIP AI"
                  subtext="Start building production-ready brand identities with autonomous AI agents."
                  buttonLabel="Sign in instead"
                  onSwitch={() => setIsLogin(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form panel — crossfade between login and signup */}
        <div
          className="flex-1 p-8 md:p-10 flex flex-col justify-center relative"
          style={{ order: isLogin ? 1 : -1 }}
        >
          <div className="md:hidden mb-8">
            <LogoMark />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="login-form"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <LoginForm />
                <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <SignupForm />
                <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground">
        <Sparkles className="w-4.5 h-4.5 text-background" />
      </div>
      <span className="text-lg font-semibold tracking-tight">SHIP AI</span>
    </div>
  );
}

function BrandPanel({
  heading,
  subtext,
  buttonLabel,
  onSwitch,
}: {
  heading: string;
  subtext: string;
  buttonLabel: string;
  onSwitch: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <LogoMark />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
        <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
          {subtext}
        </p>
      </div>
      <button
        onClick={onSwitch}
        className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
