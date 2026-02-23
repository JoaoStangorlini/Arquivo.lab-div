import { fetchSubmissions } from '@/app/actions/submissions';
import MapClient from './MapClient';

export const metadata = {
    title: 'Mapa do Instituto | Hub Lab-Div',
    description: 'Explore as mídias geolocalizadas no campus do IFUSP.',
};

export default async function MapPage() {
    const { items } = await fetchSubmissions({
        page: 1,
        limit: 100,
        query: '',
        sort: 'recentes'
    });

    return <MapClient initialItems={items as any} />;
}
