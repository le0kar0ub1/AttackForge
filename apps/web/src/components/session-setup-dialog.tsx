'use client';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSessionStore } from '@/stores/session-store';
import { ModelConfig, SessionConfig } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Plus, Bot, User, Shield, Sparkles } from 'lucide-react';

const sessionSetupSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  redTeamerId: z.string().min(1, 'Red Teamer model is required'),
  targetId: z.string().min(1, 'Target model is required'),
  judgeId: z.string().optional(),
});

type SessionSetupForm = z.infer<typeof sessionSetupSchema>;

interface SessionSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionSetupDialog({
  open,
  onOpenChange,
}: SessionSetupDialogProps) {
  const { modelConfigs, createSession } = useSessionStore();
  
  const form = useForm<SessionSetupForm>({
    resolver: zodResolver(sessionSetupSchema),
    defaultValues: {
      name: '',
      redTeamerId: '',
      targetId: '',
      judgeId: 'none',
    },
  });

  const onSubmit = (data: SessionSetupForm) => {
    const redTeamer = modelConfigs.find(m => m.id === data.redTeamerId);
    const target = modelConfigs.find(m => m.id === data.targetId);
    const judge = data.judgeId && data.judgeId !== 'none' ? modelConfigs.find(m => m.id === data.judgeId) : undefined;

    if (!redTeamer || !target) {
      return; // This shouldn't happen due to validation
    }

    const config: SessionConfig = {
      redTeamer,
      target,
      judge,
    };

    createSession(data.name, config);
    onOpenChange(false);
    form.reset();
  };

  const getModelDisplayName = (model: ModelConfig) => {
    return `${model.name} (${model.model})`;
  };

  const selectedRedTeamer = form.watch('redTeamerId');
  const selectedTarget = form.watch('targetId');

  if (modelConfigs.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-xl">No Models Configured</DialogTitle>
            <DialogDescription className="text-base">
              You need at least one model configuration to create a session.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Configure your first model to get started with adversarial testing
                </p>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Session
          </DialogTitle>
          <DialogDescription className="text-base">
            Set up a new adversarial testing session with your configured models. 
            You can use the same model for multiple roles or assign different models to each role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Session Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., GPT-4 Jailbreak Testing Session" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Give your session a descriptive name to easily identify it later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Model Assignments
                </Badge>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
              </div>

              <div className="grid gap-4">
                <Card className="group hover:shadow-md transition-all duration-200 border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <User className="h-4 w-4" />
                      Red Teamer
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription>
                      The attacking model that generates adversarial prompts to test the target
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="redTeamerId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select the attacking model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modelConfigs.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {getModelDisplayName(model)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all duration-200 border-primary/20 bg-primary/5 dark:bg-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-primary">
                      <Shield className="h-4 w-4" />
                      Target
                      <Badge variant="default" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription>
                      The model being tested for vulnerabilities and safety issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="targetId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select the model to test" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                                             {modelConfigs.map((model) => (
                                 <SelectItem key={model.id} value={model.id}>
                                   {getModelDisplayName(model)}
                                   {model.id === selectedRedTeamer && " (Same as Red Teamer)"}
                                 </SelectItem>
                               ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-md transition-all duration-200 border-secondary/20 bg-secondary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                      <Bot className="h-4 w-4" />
                      Judge
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </CardTitle>
                    <CardDescription>
                      Optional model to evaluate the conversation for safety and policy violations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="judgeId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select an evaluation model (optional)" />
                              </SelectTrigger>
                            </FormControl>
                                                         <SelectContent>
                               <SelectItem value="none">
                                 No judge model
                               </SelectItem>
                               {modelConfigs.map((model) => (
                                 <SelectItem key={model.id} value={model.id}>
                                   {getModelDisplayName(model)}
                                   {model.id === selectedRedTeamer && " (Same as Red Teamer)"}
                                   {model.id === selectedTarget && " (Same as Target)"}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 