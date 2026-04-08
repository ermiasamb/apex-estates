'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Copy,
  Mail,
  Share2,
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react';
import type { Property } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Label } from '../ui/label';

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);


export function ShareDialog({ property }: { property: Property }) {
  const { toast } = useToast();
  const [propertyUrl, setPropertyUrl] = useState('');
  const [shareOptions, setShareOptions] = useState<any[]>([]);

  useEffect(() => {
    const url = window.location.href;
    setPropertyUrl(url);
    const shareText = `Check out this property: ${property.title}`;
    
    const options = [
      { name: 'Copy Link', icon: Copy, action: () => {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copied to clipboard!' });
      }},
      { name: 'Email', icon: Mail, action: () => window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(url)}`) },
      { name: 'WhatsApp', icon: WhatsAppIcon, action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)} ${encodeURIComponent(url)}`, '_blank') },
      { name: 'Telegram', icon: Send, action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank') },
      { name: 'X (Twitter)', icon: Twitter, action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank') },
      { name: 'LinkedIn', icon: Linkedin, action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank') },
    ];

    if (navigator.share) {
        options.splice(1, 0, { name: 'Web Share', icon: Share2, action: async () => {
            try {
                await navigator.share({ title: property.title, text: shareText, url: url });
            } catch (error) {
                console.error("Web Share API error:", error);
                toast({ variant: 'destructive', title: 'Could not open share dialog.'})
            }
        }});
    }
    setShareOptions(options);

  }, [property.title, toast]);


  const copyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    toast({ title: 'Link copied to clipboard!' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 w-12 p-0 flex items-center justify-center">
          <Share2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{property.title}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {shareOptions.map((option) => (
              <div key={option.name}>
                <Button variant="outline" size="icon" className="w-16 h-16 rounded-xl" onClick={option.action}>
                  <option.icon />
                </Button>
                <p className="text-xs mt-2 text-muted-foreground">{option.name}</p>
              </div>
            ))}
          </div>
          <div className="relative">
            <Label htmlFor="share-link" className="sr-only">Shareable link</Label>
            <Input id="share-link" value={propertyUrl} readOnly />
            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
