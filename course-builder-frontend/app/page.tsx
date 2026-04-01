import Link from "next/link";
import { ArrowRight, Bot, BookOpen, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-[#24CFA6] selection:text-[#050505]">
      {/* Navbar */}
      <nav className="border-b border-neutral-800/50 bg-[#050505]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#24CFA6] font-bold text-xl">Leet</span>
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Your Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24CFA6] to-[#128a6d]">
              AI Course Architect
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop drowning in scattered YouTube tutorials and blogs. Tell LeetAI what you want to learn, and we will automatically build a structured, personalized roadmap just for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-[#24CFA6] text-black px-8 py-4 rounded-full font-semibold hover:bg-[#20ba95] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Building Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50">
            <div className="w-12 h-12 rounded-xl bg-[#24CFA6]/10 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-[#24CFA6]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">GenAI Curiosity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our LLM dynamically chats with you to extract your learning goals, timeline, and exact experience level.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50">
            <div className="w-12 h-12 rounded-xl bg-[#24CFA6]/10 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-[#24CFA6]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Curation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We scrape and rank YouTube API resources based on semantic relevance and engagement metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50">
            <div className="w-12 h-12 rounded-xl bg-[#24CFA6]/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#24CFA6]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">RAG Tutor Support</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stuck on a concept? Chat with a context-aware AI tutor trained strictly on your generated course materials.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
