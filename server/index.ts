import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import locations from '../shared/location.js';
import { BlipColor } from '@Shared/types/blip.js';
import { MarkerType } from '@Shared/types/marker.js';
import { Tattoshop_Events } from '../shared/events.js';
import { Decorator } from '@Server/player/appearance.js';

import { useTranslate } from '@Shared/translate.js';
import '../translate/index.js';
import { NotificationTypes } from '../../asc-notifications/shared/config.js';
const { t } = useTranslate('en');


const Rebar = useRebar();
const api = Rebar.useApi();
const RebarEvents = Rebar.events.useEvents();
const NotificationAPI = await Rebar.useApi().getAsync('ascended-notification-api');



const { useCurrency } = await api.getAsync('currency-api');

async function playerspawn(player: alt.Player) {
    for (let i = 0; i < locations.length; i++) {
        const position = new alt.Vector3(locations[i].x, locations[i].y, locations[i].z);

        // Create a global blip
        const blip = Rebar.controllers.useBlipGlobal({
            pos: position,
            color: BlipColor.BLUE,
            sprite: 75,
            shortRange: true,
            text: t('tattoo.shop.blip.name'),
        });

        // Create a global marker
        const globalMarker = Rebar.controllers.useMarkerGlobal({
            pos: position,
            color: new alt.RGBA(255, 0, 0, 255),
            dimension: 0,
            scale: new alt.Vector3(1, 1, 0.25),
            type: MarkerType.CYLINDER,
        });

        const interaction = Rebar.controllers.useInteraction(
            new alt.ColshapeCylinder(locations[i].x, locations[i].y, locations[i].z, 5, 2),
            'player'
        );
        
        // Listen for the player to hit 'E' to interact
        interaction.on(handleInteraction);
        
        function handleInteraction(player: alt.Player) {
            alt.emitClient(player, Tattoshop_Events.ToClient.TATTOOSHOP_OPEN);
        }
        
    }
}



alt.onClient(Tattoshop_Events.ToServer.TATTOO_PREVIEW, (player: alt.Player, collection, overlay) => {
    player.clearDecorations();
    Rebar.player.usePlayerAppearance(player).updateTattoos();
    player.addDecoration(collection, overlay);
})

alt.onClient(Tattoshop_Events.ToServer.TATTOO_BUY, async (player: alt.Player, collection, overlay, price) => {
    const characterCurrency = useCurrency(player, 'Character');
    let cash = await characterCurrency.get('cash');
    
    if(cash < price) {
        NotificationAPI.create(player, {
            title: t('tattoo.shop.notif.title'),
            subTitle: t('tattoo.shop.notif.subtitle.warning'),
            message: t('tattoo.shop.not.enough.money'),
            icon: NotificationTypes.warning,
            duration: 5000,
        });
        player.clearDecorations();
        Rebar.player.usePlayerAppearance(player).sync()
        return
    } else {
        NotificationAPI.create(player, {
            title: t('tattoo.shop.notif.title'),
            subTitle: t('tattoo.shop.notif.subtitle.succes'),
            message: t('tattoo.shop.notif.bought'),
            icon: NotificationTypes.success,
            duration: 5000,
        });
        await useCurrency(player, 'Character').sub('cash', price)
    }

    const document = Rebar.document.character.useCharacter(player);
    const data = document.get();
    if (!data || !data.appearance) {
        return;
    }

    let decors: Array<Decorator> = [];
    
    if (data.appearance.tattoos) {
        decors = decors.concat(data.appearance.tattoos);
    }

    decors.push({
        overlay: overlay,
        collection: collection
    })

    player.clearDecorations();

    for (let decor of decors) {
        player.addDecoration(decor.collection, decor.overlay);
    }

    Rebar.player.usePlayerAppearance(player).setTattoos(decors);
}) 

alt.onClient(Tattoshop_Events.ToServer.TATTOO_DELETE, (player: alt.Player) => {
    const document = Rebar.document.character.useCharacter(player);
    const data = document.get();

    if (!data || !data.appearance) {
        return;
    }

    let decors: Array<Decorator> = [];

    player.clearDecorations();
    Rebar.player.usePlayerAppearance(player).setTattoos(decors);
})


RebarEvents.on('character-bound', (player, document) => {
    playerspawn(player)
});
