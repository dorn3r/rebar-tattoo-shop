import * as alt from 'alt-client';
import * as native from 'natives';
import { Tattoshop_Events } from '../shared/events.js';
import { useWebview } from '@Client/webview/index.js';
import { useClientApi } from '@Client/api/index.js';

const CameraAPI = useClientApi().get('ascended-camera-api');
const webview = useWebview();

alt.onServer(Tattoshop_Events.ToClient.TATTOOSHOP_OPEN, async () => {
    webview.show('Tattoo', 'page');

    //Camera API
    CameraAPI.ease(true, 2000);
    CameraAPI.onMovementControl(false);
    CameraAPI.focusOnPlayer();
    CameraAPI.setCameraOffset(0, 0, 0);

    webview.on('CAMERA_MOVE_START', CameraAPI.cameraMoveStart);
    webview.on('CAMERA_MOVE_END', CameraAPI.cameraMoveEnd);
    webview.on('CAMERA_SCROLL_UP', CameraAPI.cameraMoveIn);
    webview.on('CAMERA_SCROLL_DOWN', CameraAPI.cameraMoveOut);

    // Tattoo-Shop
    webview.on(Tattoshop_Events.WebView.CLOSE, closeShop);
    webview.on(Tattoshop_Events.WebView.TATTOO_PREVIEW, previewtattoo);
    webview.on(Tattoshop_Events.ToServer.TATTOO_BUY, buytattoo);
});

async function closeShop() {
    webview.hide('Tattoo');

    CameraAPI.onMovementControl(true);
    webview.off('CAMERA_MOVE_START');
    webview.off('CAMERA_MOVE_END');
    webview.off('CAMERA_SCROLL_UP');
    webview.off('CAMERA_SCROLL_DOWN');
}

async function buytattoo(currenttattoo) {
    const ped = native.getEntityModel(alt.Player.local.scriptID);
    const fModel = alt.hash('mp_f_freemode_01');
    const mModel = alt.hash(`mp_m_freemode_01`);

    if (ped === mModel) {
        const collection = currenttattoo.Collection;
        const overlay = currenttattoo.HashNameMale;
        const price = currenttattoo.Price;
        alt.emitServer(Tattoshop_Events.ToServer.TATTOO_BUY, collection, overlay, price);
    } else {
        const collection = currenttattoo.Collection;
        const overlay = currenttattoo.HashNameFemale;
        const price = currenttattoo.Price;
        alt.emitServer(Tattoshop_Events.ToServer.TATTOO_BUY, collection, overlay, price);
    }
}

async function previewtattoo(currenttattoo) {
    const ped = native.getEntityModel(alt.Player.local.scriptID);
    const fModel = alt.hash('mp_f_freemode_01');
    const mModel = alt.hash(`mp_m_freemode_01`);

    if (ped === mModel) {
        const collection = alt.hash(currenttattoo.Collection);
        const overlay = alt.hash(currenttattoo.HashNameMale);
        alt.emitServer(Tattoshop_Events.ToServer.TATTOO_PREVIEW, collection, overlay);
    } else {
        const collection = alt.hash(currenttattoo.Collection);
        const overlay = alt.hash(currenttattoo.HashNameFemale);
        alt.emitServer(Tattoshop_Events.ToServer.TATTOO_PREVIEW, collection, overlay);
    }
}
