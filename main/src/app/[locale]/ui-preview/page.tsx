'use client';

import {
  AlertCircle,
  Check,
  ChevronDown,
  MoreHorizontal,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const colorTokens = [
  ['background', 'bg-background text-foreground'],
  ['foreground', 'bg-foreground text-background'],
  ['card', 'bg-card text-card-foreground'],
  ['primary', 'bg-primary text-primary-foreground'],
  ['secondary', 'bg-secondary text-secondary-foreground'],
  ['muted', 'bg-muted text-muted-foreground'],
  ['accent', 'bg-accent text-accent-foreground'],
  ['destructive', 'bg-destructive text-destructive-foreground'],
  ['brand.primary', 'bg-brand-primary text-primary-foreground'],
  ['brand.gold', 'bg-brand-gold text-foreground'],
  ['brand.purple', 'bg-brand-purple text-primary-foreground'],
] as const;

const buttonVariants = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
  'brand-purple',
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-heading-3 font-medium">{title}</h2>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  );
}

export default function UiPreviewPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-10 sm:px-8 lg:px-12">
        <header className="max-w-3xl space-y-4">
          <Badge variant="outline">OraSage UI Preview</Badge>
          <h1 className="font-serif text-display-2 font-medium tracking-tight">
            UI Design System Foundation
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Development-only preview for tokens, shadcn/ui primitives, interaction states,
            multilingual stress, and accessibility baselines.
          </p>
        </header>

        <Section title="Color Tokens">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colorTokens.map(([name, className]) => (
              <div key={name} className={`rounded-md border border-border p-4 ${className}`}>
                <div className="text-sm font-semibold">{name}</div>
                <div className="mt-8 text-xs opacity-80">semantic token</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography, Spacing, Radius">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>把传统智慧转译为现代人的个人洞察</CardTitle>
                <CardDescription>
                  Clarity, not certainty. 提供清晰，而不是兜售确定性。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-heading-1 font-serif">Heading 1 / 中文标题</p>
                <p className="text-heading-3 font-serif">Heading 3 / Editorial serif</p>
                <p className="max-w-prose text-base leading-relaxed">
                  Body text supports readable long-form content, 200% zoom, and multilingual
                  expansion without relying on compressed letter spacing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scale</CardTitle>
                <CardDescription>4px grid, restrained radii, semantic shadows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="size-4 rounded-sm bg-primary" />
                  <div className="size-8 rounded-md bg-primary" />
                  <div className="size-12 rounded-lg bg-primary" />
                  <div className="size-16 rounded-xl bg-primary" />
                </div>
                <div className="rounded-sm border border-border p-3">radius-sm</div>
                <div className="rounded-lg border border-border p-5">radius-lg</div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Settings">
                <Settings />
              </Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="Forms">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input, Textarea, Select</CardTitle>
                <CardDescription>Shared height, border, radius, focus, invalid states.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="preview-name">Name</Label>
                  <Input id="preview-name" placeholder="OraSage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview-invalid">Invalid field</Label>
                  <Input id="preview-invalid" aria-invalid="true" defaultValue="Needs review" />
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    Include text and icon, not color alone.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview-note">Note</Label>
                  <Textarea id="preview-note" placeholder="Write a short report note..." />
                </div>
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select defaultValue="paper">
                    <SelectTrigger>
                      <SelectValue placeholder="Choose mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Paper Editorial</SelectItem>
                      <SelectItem value="dark">Dark Editorial</SelectItem>
                      <SelectItem value="contrast">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox, Radio, Switch</CardTitle>
                <CardDescription>Keyboard reachable and visible focus by default.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">Checked option</Label>
                </div>
                <RadioGroup defaultValue="bazi">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="bazi" id="bazi" />
                    <Label htmlFor="bazi">八字</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="ziwei" id="ziwei" />
                    <Label htmlFor="ziwei">Zi Wei Dou Shu</Label>
                  </div>
                </RadioGroup>
                <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
                  <Label htmlFor="preview-switch">Reduced motion friendly</Label>
                  <Switch id="preview-switch" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Feedback, Cards, Tabs">
          <div className="grid gap-6 lg:grid-cols-3">
            <Alert className="lg:col-span-2">
              <Sparkles className="mb-2 size-4" aria-hidden="true" />
              <AlertTitle>Accessible status</AlertTitle>
              <AlertDescription>
                Status components include text. Tooltip content remains supplemental.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="mb-2 size-4" aria-hidden="true" />
              <AlertTitle>Invalid state</AlertTitle>
              <AlertDescription>Errors include labels, icons, and messages.</AlertDescription>
            </Alert>
          </div>
          <Tabs defaultValue="cards">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Default</CardTitle>
                  <CardDescription>Base container only.</CardDescription>
                </CardHeader>
              </Card>
              <Card variant="interactive" tabIndex={0} role="button">
                <CardHeader>
                  <CardTitle>Interactive</CardTitle>
                  <CardDescription>Hover, active, focus-visible.</CardDescription>
                </CardHeader>
              </Card>
              <Card variant="editorial">
                <CardHeader>
                  <CardTitle>Editorial</CardTitle>
                  <CardDescription>No forced card-heavy visual language.</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="loading" className="space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-32" />
            </TabsContent>
            <TabsContent value="text" className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">简体中文短文本</CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">English short label with growth</CardContent>
              </Card>
              <Card dir="rtl">
                <CardContent className="p-5 text-start">نص عربي قصير</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Dialog, Dropdown, Tooltip">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog title</DialogTitle>
                  <DialogDescription>
                    Focus is moved into the dialog, Escape closes it, and focus returns to the
                    trigger.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="dialog-input">Focusable field</Label>
                  <Input id="dialog-input" placeholder="Keyboard test" />
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Check className="size-4" />
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Dropdown
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Preview menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Semantic action</DropdownMenuItem>
                <DropdownMenuCheckboxItem checked>Checked state</DropdownMenuCheckboxItem>
                <DropdownMenuItem disabled>Disabled action</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More information">
                  <MoreHorizontal />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Supplemental label only</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section title="Light, Dark, LTR, RTL">
          <div className="grid gap-6 lg:grid-cols-2">
            <div data-theme="paper" className="rounded-lg border border-border bg-background p-5 text-foreground">
              <h3 className="font-serif text-heading-4">Paper Editorial</h3>
              <p className="mt-2 text-muted-foreground">
                Calm reading surfaces with jade primary actions and limited brass accents.
              </p>
              <Button className="mt-4">Primary CTA</Button>
            </div>
            <div className="dark rounded-lg border border-border bg-background p-5 text-foreground">
              <h3 className="font-serif text-heading-4">Dark Editorial</h3>
              <p className="mt-2 text-muted-foreground">
                Dark mode variables are ready without forcing the current homepage mode.
              </p>
              <Button className="mt-4">Primary CTA</Button>
            </div>
            <div dir="ltr" className="rounded-lg border border-border p-5">
              <Badge variant="muted">LTR</Badge>
              <p className="mt-3">Pattern observation, not absolute prediction.</p>
            </div>
            <div dir="rtl" className="rounded-lg border border-border p-5 text-start">
              <Badge variant="muted">RTL</Badge>
              <p className="mt-3">ملاحظة الأنماط وليست نتيجة مطلقة.</p>
            </div>
          </div>
        </Section>
      </main>
    </TooltipProvider>
  );
}
