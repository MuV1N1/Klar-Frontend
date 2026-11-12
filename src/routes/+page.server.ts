import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ request }) => {
    const acceptLanguage = request.headers.get('accept-language') ?? '';

    const locale = acceptLanguage.toLowerCase().startsWith('de')
        ? 'de'
        : 'en';

    redirect(302, `/${locale}`);
};