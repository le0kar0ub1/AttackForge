'use client';

import { useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { ModelConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Settings, MessageSquare, Download, Sparkles, Zap, Edit, Trash2 } from 'lucide-react';
import { SessionSetupDialog } from '@/components/session-setup-dialog';
import { ModelConfigDialog } from '@/components/model-config-dialog';
import { ConversationView } from '@/components/conversation-view';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const [showSessionSetup, setShowSessionSetup] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | undefined>(undefined);
  const [modelToDelete, setModelToDelete] = useState<ModelConfig | null>(null);
  
  const {
    currentSession,
    sessions,
    modelConfigs,
    loadSession,
    deleteSession,
    deleteModelConfig,
    exportSession,
  } = useSessionStore();

  const handleExport = (sessionId: string, format: 'json' | 'markdown') => {
    const content = exportSession(sessionId, format);
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/markdown' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
    setShowModelConfig(true);
  };

  const handleDeleteModel = (model: ModelConfig) => {
    setModelToDelete(model);
  };

  const confirmDeleteModel = () => {
    if (modelToDelete) {
      deleteModelConfig(modelToDelete.id);
      setModelToDelete(null);
    }
  };

  const handleModelDialogClose = (open: boolean) => {
    setShowModelConfig(open);
    if (!open) {
      setEditingModel(undefined);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AttackForge
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            LLM Adversarial Testing Platform - Test AI Safety with Style
          </p>
        </div>
        <div className="flex gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => {
              setEditingModel(undefined);
              setShowModelConfig(true);
            }}
            className="shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Models
          </Button>
          <Button 
            onClick={() => setShowSessionSetup(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {currentSession ? (
        <ConversationView />
      ) : (
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="sessions" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="models"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Model Configurations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recent Sessions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your adversarial testing sessions
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSessionSetup(true)}
                className="shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
            
            {sessions.length === 0 ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 via-background to-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 mb-6">
                    <MessageSquare className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Create your first adversarial testing session to start exploring AI safety and vulnerability testing.
                  </p>
                  <Button 
                    onClick={() => setShowSessionSetup(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Your First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="group cursor-pointer hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card to-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                          {session.name}
                        </CardTitle>
                        <Badge 
                          variant={session.status === 'active' ? 'default' : 'secondary'}
                          className={session.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-muted-foreground">Red Teamer:</span>
                          <span className="font-medium">{session.config.redTeamer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-muted-foreground">Target:</span>
                          <span className="font-medium">{session.config.target.name}</span>
                        </div>
                        {session.config.judge && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-muted-foreground">Judge:</span>
                            <span className="font-medium">{session.config.judge.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <MessageSquare className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {session.messages.length} messages
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadSession(session.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(session.id, 'json')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSession(session.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="models" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Model Configurations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your AI model endpoints and settings
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingModel(undefined);
                  setShowModelConfig(true);
                }}
                className="shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </div>
            
            {modelConfigs.length === 0 ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 via-background to-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 mb-6">
                    <Settings className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No models configured</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Configure your AI models to start adversarial testing. You only need one model to get started.
                  </p>
                  <Button 
                    onClick={() => {
                      setEditingModel(undefined);
                      setShowModelConfig(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Model
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modelConfigs.map((config) => (
                  <Card key={config.id} className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card to-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                          <Settings className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {config.name}
                          </CardTitle>
                          <CardDescription className="text-sm font-mono">
                            {config.model}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">API:</span>
                          <span className="font-medium text-xs">
                            {new URL(config.apiUrl).hostname}
                          </span>
                        </div>
                        {config.systemPrompt && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-muted-foreground">System prompt configured</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs">
                          Ready to use
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditModel(config)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteModel(config)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <SessionSetupDialog
        open={showSessionSetup}
        onOpenChange={setShowSessionSetup}
      />
      
      <ModelConfigDialog
        open={showModelConfig}
        onOpenChange={handleModelDialogClose}
        editConfig={editingModel}
      />

      <AlertDialog open={!!modelToDelete} onOpenChange={() => setModelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{modelToDelete?.name}&quot;? This action cannot be undone.
              Any sessions using this model will need to be reconfigured.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteModel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
