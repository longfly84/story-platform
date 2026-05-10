import AIFactoryPanelView from './components/AIFactoryPanelView'
import { useAIFactoryPanelController } from './hooks/useAIFactoryPanelController'

export default function AIFactoryPanel() {
  const controller = useAIFactoryPanelController()

  return <AIFactoryPanelView {...controller} />
}
