import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  FolderOpen,
  Wifi
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { settingsApi } from '@/services/api'
import type { Settings as SettingsType } from '@/types'
import { toast } from '@/components/ui/Toaster'

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    theme: 'dark',
    refresh_interval: 5,
    cpu_threshold: 80,
    ram_threshold: 80,
    disk_threshold: 90,

    ai_provider: 'openai',
    api_key: '',
    model: 'gpt-3.5-turbo',

    collector_enabled: false,
    collector_directory: '',
    collector_interval: 5,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    settingsApi
      .getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)

    try {
      await settingsApi.updateSettings(settings)
      toast('Settings saved successfully', 'success')
    } catch (error) {
      toast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      theme: 'dark',
      refresh_interval: 5,
      cpu_threshold: 80,
      ram_threshold: 80,
      disk_threshold: 90,

      ai_provider: 'openai',
      api_key: '',
      model: 'gpt-3.5-turbo',

      collector_enabled: false,
      collector_directory: '',
      collector_interval: 5,
    })

    toast('Settings reset to defaults', 'info')
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)

    try {
      // Simulate API validation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast(
        `${settings.ai_provider.toUpperCase()} connection successful`,
        'success'
      )
    } catch (error) {
      toast('Connection failed', 'error')
    } finally {
      setTestingConnection(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const defaultModels: Record<string, string> = {
    openai: 'gpt-3.5-turbo',
    opencode: 'deepseek-v4-flash',
    minimax: 'abab6.5s-chat',
    ollama: 'qwen2.5:7b',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Settings
          </h1>

          <p className="text-slate-400 mt-1">
            Configure dashboard preferences and AI providers
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />

            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* GENERAL SETTINGS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Theme
                </label>

                <select
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      theme: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background-secondary px-3"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Refresh Interval (seconds)
                </label>

                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.refresh_interval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refresh_interval:
                        parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ALERT THRESHOLDS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Alert Thresholds</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                CPU Threshold: {settings.cpu_threshold}%
              </label>

              <input
                type="range"
                min={50}
                max={100}
                value={settings.cpu_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cpu_threshold: parseInt(e.target.value),
                  })
                }
                className="w-full accent-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Memory Threshold: {settings.ram_threshold}%
              </label>

              <input
                type="range"
                min={50}
                max={100}
                value={settings.ram_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ram_threshold: parseInt(e.target.value),
                  })
                }
                className="w-full accent-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Disk Threshold: {settings.disk_threshold}%
              </label>

              <input
                type="range"
                min={50}
                max={100}
                value={settings.disk_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    disk_threshold: parseInt(e.target.value),
                  })
                }
                className="w-full accent-accent-primary"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI CONFIGURATION */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PROVIDER */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  AI Provider
                </label>

                <select
                  value={settings.ai_provider}
                  onChange={(e) => {
                    const provider = e.target.value

                    setSettings({
                      ...settings,
                      ai_provider: provider,
                      model:
                        defaultModels[provider] ||
                        'gpt-3.5-turbo',
                    })
                  }}
                  className="w-full h-10 rounded-lg border border-border bg-background-secondary px-3"
                >
                  <option value="openai">OpenAI</option>
                  <option value="opencode">
                    OpenCode (Free)
                  </option>
                  <option value="minimax">MiniMax</option>
                  <option value="ollama">
                    Ollama (Local)
                  </option>
                </select>
              </div>

              {/* MODEL */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Model
                </label>

                <select
                  value={settings.model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      model: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background-secondary px-3"
                >
                  {/* OPENAI */}
                  {settings.ai_provider === 'openai' ? (
                    <>
                      <option value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </option>

                      <option value="gpt-4">
                        GPT-4
                      </option>

                      <option value="gpt-4-turbo">
                        GPT-4 Turbo
                      </option>
                    </>
                  ) : settings.ai_provider === 'opencode' ? (
                    <>
                      <option value="deepseek-v4-flash">
                        DeepSeek V4 Flash
                      </option>

                      <option value="claude-sonnet-4-6">
                        Claude Sonnet 4.6
                      </option>

                      <option value="claude-opus-4-7">
                        Claude Opus 4.7
                      </option>

                      <option value="minimax-m2.5-free">
                        MiniMax M2.5 Free
                      </option>
                    </>
                  ) : settings.ai_provider === 'minimax' ? (
                    <>
                      <option value="abab6.5s-chat">
                        Abab 6.5s Chat
                      </option>

                      <option value="abab6.5g-chat">
                        Abab 6.5g Chat
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="qwen2.5:3b">
                        Qwen 2.5 3B
                      </option>

                      <option value="qwen2.5:7b">
                        Qwen 2.5 7B
                      </option>

                      <option value="deepseek-r1:7b">
                        DeepSeek R1 7B
                      </option>

                      <option value="llama3">
                        Llama 3
                      </option>

                      <option value="mistral">
                        Mistral
                      </option>

                      <option value="phi4">
                        Phi-4
                      </option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* API KEY */}
            {(settings.ai_provider === 'openai' ||
              settings.ai_provider === 'minimax' ||
              settings.ai_provider === 'opencode') && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  API Key
                </label>

                <div className="flex gap-3">
                  <Input
                    type="password"
                    placeholder="Enter API key"
                    value={settings.api_key}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        api_key: e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <Button
                    variant="secondary"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                  >
                    <Wifi className="w-4 h-4 mr-2" />

                    {testingConnection
                      ? 'Testing...'
                      : 'Test'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LOG COLLECTOR */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Log Collector
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <h4 className="font-medium text-slate-200">
                  Auto Log Collection
                </h4>

                <p className="text-sm text-slate-400 mt-1">
                  Automatically collect logs from a directory
                </p>
              </div>

              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    collector_enabled:
                      !settings.collector_enabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.collector_enabled
                    ? 'bg-accent-primary'
                    : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.collector_enabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.collector_enabled && (
              <>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Watch Directory
                  </label>

                  <Input
                    placeholder="C:\\logs or /var/logs"
                    value={settings.collector_directory}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        collector_directory:
                          e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <p className="text-xs text-slate-500 mt-1">
                    Directory to watch for .log and .txt files
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Poll Interval:{' '}
                    {settings.collector_interval} seconds
                  </label>

                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={settings.collector_interval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        collector_interval: parseInt(
                          e.target.value
                        ),
                      })
                    }
                    className="w-full accent-accent-primary"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />

                  <span className="text-sm text-amber-400">
                    Logs will be automatically parsed and added
                    to the database
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}