 import { MessageLoading } from "@/components/ui/message-loading";
 import logo from "@/assets/logo.png";
 
 const LoadingScreen = () => {
   return (
     <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
       <div className="text-center flex flex-col items-center">
         {/* 3D Logo with glass effect */}
         <div className="relative mb-8">
           {/* Glow effect behind logo */}
           <div 
             className="absolute inset-0 blur-2xl opacity-30"
             style={{
               background: 'radial-gradient(circle, hsl(var(--foreground) / 0.3) 0%, transparent 70%)',
             }}
           />
           {/* 3D perspective container */}
           <div 
             className="relative w-24 h-24 animate-float"
             style={{
               perspective: '1000px',
               transformStyle: 'preserve-3d',
             }}
           >
             {/* Logo with 3D transform and glass reflection */}
             <div 
               className="relative w-full h-full"
               style={{
                 transform: 'rotateY(-5deg) rotateX(5deg)',
                 transformStyle: 'preserve-3d',
               }}
             >
               <img 
                 src={logo} 
                 alt="Technologiya Logo" 
                 className="w-full h-full object-contain drop-shadow-2xl dark:invert"
                 style={{
                   filter: 'drop-shadow(0 10px 30px hsl(var(--foreground) / 0.2))',
                 }}
               />
               {/* Glass reflection overlay */}
               <div 
                 className="absolute inset-0 rounded-lg opacity-20"
                 style={{
                   background: 'linear-gradient(135deg, hsl(var(--foreground) / 0.1) 0%, transparent 50%)',
                 }}
               />
             </div>
           </div>
         </div>
         
         {/* Message Loading animation */}
         <div className="flex items-center gap-2">
           <MessageLoading />
         </div>
       </div>
     </div>
   );
 };
 
 export default LoadingScreen;
