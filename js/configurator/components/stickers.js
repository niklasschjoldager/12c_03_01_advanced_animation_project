export function stickers() {
    const settings = {
        templates: {
            sticker: document.querySelector(".t-sticker").content,
            stickerOption: document.querySelector(".t-sticker-option").content,
        },
        stickers: ["bowser", "luigi", "mario", "star", "toad"],
        stickerId: 1,
    };

    settings.stickers.forEach((sticker) => {
        makeStickerOption(sticker, settings.templates.stickerOption);
    });

    function makeStickerOption(sticker, template) {
        const clone = template.cloneNode(true);
        const stickerOptionList = document.querySelector("[data-option=stickers]");

        // Add image
        clone.querySelector(".c-option__image--sticker").src = `images/stickers/png/${sticker}.png`;
        // Add sticker to page on click

        clone.querySelector(".c-option--sticker").addEventListener("click", addSticker);

        // Show sticker option
        stickerOptionList.append(clone);

        function addSticker() {
            console.log("add sticker", sticker);

            const screen = document.querySelector("[data-js-hook=screen]");

            const clone = settings.templates.sticker.cloneNode(true);
            clone.querySelector(".c-sticker__image").src = `images/stickers/png/${sticker}.png`;
            clone.querySelector(".c-sticker").setAttribute("data-sticker-id", settings.stickerId);
            clone.querySelector(".c-sticker").setAttribute("data-sticker-type", sticker);

            screen.append(clone);

            makeEditable(settings);

            settings.stickerId++;
        }
    }

    console.log("Stickers component is loaded...");
}

function makeEditable(settings) {
    const screen = document.querySelector("[data-js-hook=screen]");

    const sticker = document.querySelector(`.c-sticker[data-sticker-id="${settings.stickerId}"]`);
    changeActiveSticker(sticker);
    const rotateButton = sticker.querySelector(`[data-sticker-action="rotate"]`);
    const resizeButton = sticker.querySelector(`[data-sticker-action="resize"]`);
    const deleteButton = sticker.querySelector(`[data-sticker-action="delete"]`);
    const duplicateButton = sticker.querySelector(`[data-sticker-action="duplicate"]`);

    // Rotate
    const rotate = Draggable.create(sticker, {
        type: "rotation",
        allowEventDefault: true,
    })[0].disable();

    // Move
    const move = Draggable.create(sticker, {
        type: "x, y",
        bounds: document.querySelector("[data-js-hook=screen]"),
        allowEventDefault: true,
    })[0].enable();

    TweenLite.set(resizeButton, { top: sticker.offsetWidth - 28, left: sticker.offsetHeight - 28 });

    // Resize
    const resize = Draggable.create(sticker.querySelector(`[data-sticker-action="resize"]`), {
        type: "left",
        bounds: {
            maxX: 272,
        },
        onPress: function (e) {
            e.stopPropagation();
        },
        onDrag: function (e) {
            TweenLite.set(sticker.querySelector(`[data-sticker-action="resize"]`), { top: sticker.offsetWidth - 28 });
            TweenLite.set(this.target.parentNode.parentNode, { width: this.x + 28 });
        },
    })[0].disable();

    // Move event
    sticker.addEventListener("mousedown", function (event) {
        event.stopPropagation();
        rotate.disable();
        resize.disable();
        sticker.addEventListener("blur", unselectSticker);
        changeActiveSticker(sticker);
        move.enable().startDrag(event);
    });

    // Rotate event
    rotateButton.addEventListener("mousedown", function (event) {
        event.stopPropagation();
        move.disable();
        resize.disable();

        rotate.enable().startDrag(event);
    });

    // Resize event
    resizeButton.addEventListener("mousedown", function (event) {
        event.stopPropagation();
        move.disable();
        rotate.disable();

        resize.enable().startDrag(event);
    });

    // Delete click
    deleteButton.addEventListener("mousedown", function (event) {
        event.stopPropagation();
        move.kill();
        rotate.kill();
        resize.kill();
        sticker.remove();
    });

    // Duplicate click
    duplicateButton.addEventListener("mousedown", function (event) {
        move.disable();
        rotate.disable();
        resize.disable();

        duplicateSticker();
        console.log("duplicate: ", sticker.dataset.stickerType);
    });

    function duplicateSticker() {
        const clone = sticker.cloneNode(true);
        settings.stickerId++;
        clone.setAttribute("data-sticker-id", settings.stickerId);
        console.log(clone);
        screen.append(clone);

        makeEditable(settings);
    }

    function changeActiveSticker(newActiveSticker) {
        const activeSticker = document.querySelector(".c-sticker.is-active");

        if (activeSticker) {
            activeSticker.classList.remove("is-active");
        }

        newActiveSticker.classList.add("is-active");
    }

    function unselectSticker(event) {
        sticker.removeEventListener("blur", unselectSticker);

        sticker.classList.remove("is-active");
    }
}
