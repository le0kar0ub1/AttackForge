'use client';

import { useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, MessageSquare, Download } from 'lucide-react';
import { SessionSetupDialog } from '@/components/session-setup-dialog';
import { ModelConfigDialog } from '@/components/model-config-dialog';
import { ConversationView } from '@/components/conversation-view';

export default function Dashboard() {
  const [showSessionSetup, setShowSessionSetup] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const {
    currentSession,
    sessions,
    modelConfigs,
    loadSession,
    deleteSession,
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AttackForge</h1>
          <p className="text-muted-foreground">
            LLM Adversarial Testing Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModelConfig(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Models
          </Button>
          <Button onClick={() => setShowSessionSetup(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {currentSession ? (
        <ConversationView />
      ) : (
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="models">Model Configurations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Sessions</h2>
              <Button
                variant="outline"
                onClick={() => setShowSessionSetup(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
            
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first adversarial testing session to get started.
                  </p>
                  <Button onClick={() => setShowSessionSetup(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>Red Teamer: {session.config.redTeamer.name}</div>
                        <div>Target: {session.config.target.name}</div>
                        {session.config.judge && (
                          <div>Judge: {session.config.judge.name}</div>
                        )}
                        <div>{session.messages.length} messages</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => loadSession(session.id)}
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(session.id, 'json')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSession(session.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="models" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Model Configurations</h2>
              <Button
                variant="outline"
                onClick={() => setShowModelConfig(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </div>
            
            {modelConfigs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No models configured</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your first model configuration to start testing.
                  </p>
                  <Button onClick={() => setShowModelConfig(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Model
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modelConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <CardDescription>{config.model}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>API: {new URL(config.apiUrl).hostname}</div>
                        {config.systemPrompt && (
                          <div>Has system prompt</div>
                        )}
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
        onOpenChange={setShowModelConfig}
      />
    </div>
  );
}
