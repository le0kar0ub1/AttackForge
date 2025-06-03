'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSessionStore } from '@/stores/session-store';
import { ModelConfig } from '@attackforge/shared';
import { testModelConnection } from '@/lib/api';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const modelConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().min(1, 'Model name is required'),
  systemPrompt: z.string().optional(),
});

type ModelConfigForm = z.infer<typeof modelConfigSchema>;

interface ModelConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editConfig?: ModelConfig;
}

export function ModelConfigDialog({
  open,
  onOpenChange,
  editConfig,
}: ModelConfigDialogProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { addModelConfig, updateModelConfig } = useSessionStore();

  const form = useForm<ModelConfigForm>({
    resolver: zodResolver(modelConfigSchema),
    defaultValues: editConfig || {
      name: '',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: '',
      model: '',
      systemPrompt: '',
    },
  });

  const onSubmit = async (data: ModelConfigForm) => {
    const config: ModelConfig = {
      id: editConfig?.id || crypto.randomUUID(),
      ...data,
    };

    if (editConfig) {
      updateModelConfig(config);
    } else {
      addModelConfig(config);
    }

    onOpenChange(false);
    form.reset();
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const values = form.getValues();
    
    // Validate required fields first
    const result = modelConfigSchema.safeParse(values);
    if (!result.success) {
      form.trigger(); // Show validation errors
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const config: ModelConfig = {
        id: 'test',
        ...values,
      };
      
      const success = await testModelConnection(config);
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {editConfig ? 'Edit Model Configuration' : 'Add Model Configuration'}
          </DialogTitle>
          <DialogDescription>
            Configure a model for adversarial testing. All API keys are stored locally only.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="GPT-4 Red Team" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name for this model configuration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://openrouter.ai/api/v1/chat/completions" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    OpenAI-compatible API endpoint URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="openai/gpt-4" {...field} />
                  </FormControl>
                  <FormDescription>
                    Model identifier as expected by the API.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="sk-..."
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    API key for authentication. Stored locally only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional system prompt to set the model's behavior.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {testResult && (
              <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult === 'success'
                    ? 'Connection test successful! The model is reachable.'
                    : 'Connection test failed. Please check your configuration.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editConfig ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 