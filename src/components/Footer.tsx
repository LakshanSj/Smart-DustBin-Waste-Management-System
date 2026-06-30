const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700/50 mt-auto py-4 px-6 bg-white/80 dark:bg-transparent backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-600 text-xs">
          &copy; {year}{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">
            Smart Dustbin Monitor
          </span>{' '}
          &mdash; IoT Smart City Project
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>
    </footer>
  );
};

export default Footer;
