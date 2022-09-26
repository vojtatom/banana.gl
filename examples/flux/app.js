window.onload = () => {
    const canvas = document.getElementById("canvas");

    const gl = new BananaGL.BananaGL({ 
        canvas: canvas,
        background: 0x222222,
        hideCopyright: true,
        fluxWorker: "../dist/fluxWorker.js",
        onHover: (id, metadata) => {
            console.log(metadata);
            return 'hello! ' + metadata.stringID;
        }
    });

    gl.loadLayer({
        type: "flux",
        driverType: "network",
        api: "http://flux.oncue.design/network",
        networkThickness: 20,
        networkTransparency: 0.1,
        crossroadColor: 0x111111,
    });

    gl.loadLayer({
        type: "flux",
        driverType: "landuse",
        api: "http://flux.oncue.design/landuse",
        meshOpacity: 0.5, //tile opacity
        landuseBorderTransparency: 0.5,
        landuseBorderThickness: 1,
    });

    gl.loadLayer({
        type: "flux",
        driverType: "population",
        api: ["http://flux.oncue.design/population", "http://flux.oncue.design/network"],
        networkThickness: 15,
    });
}

