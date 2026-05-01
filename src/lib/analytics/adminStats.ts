import { supabase } from '@/lib/supabase'

export async function getAdminAnalyticsSummary() {
  try {
    const res: any = await supabase.rpc('get_admin_analytics_summary')
    if (res.error) {
      console.warn('[admin-analytics-error]', res.error)
      return null
    }
    return res.data
  } catch (e) {
    console.warn('[admin-analytics-error]', e)
    return null
  }
}
