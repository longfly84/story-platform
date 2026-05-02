import { supabase } from '@/lib/supabase'

export async function getActiveAdsByPlacement(placement: string) {
  try {
    const res: any = await supabase.from('ads')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (res.error) {
      console.warn('[ads-getActive-error]', res.error)
      return []
    }
    return res.data || []
  } catch (e) {
    console.warn('[ads-getActive-exception]', e)
    return []
  }
}
