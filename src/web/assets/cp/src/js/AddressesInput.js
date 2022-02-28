/** global: Craft */

/**
 * AddressInput class
 */
Craft.AddressesInput = Garnish.Base.extend({
    $container: null,
    $addBtn: null,
    $cards: null,

    init: function(container, settings) {
        this.$container = $(container);
        this.setSettings(settings, Craft.AddressesInput.defaults);

        // Is this already an address input?
        if (this.$container.data('addresses')) {
            console.warn('Double-instantiating an address input on an element');
            this.$container.data('addresses').destroy();
        }

        this.$container.data('addresses', this);

        this.$addBtn = this.$container.find('> .btn.add');
        this.$cards = this.$container.find('> .address-card');

        for (let i = 0; i < this.$cards.length; i++) {
            this.initCard(this.$cards.eq(i));
        }

        this.updateAddButton();

        this.addListener(this.$addBtn, 'click', () => {
            this.createAddress();
        });
    },

    initCard: function($card) {
        this.addListener($card, 'click', () => {
            this.editAddress($card);
        });

        const $actionBtn = $card.find('.menubtn');
        if ($actionBtn.length) {
            const $menu = $actionBtn.data('trigger').$container;
            const $deleteBtn = $menu.find('[data-action="delete"]');
            this.addListener($deleteBtn, 'click', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                if (confirm(Craft.t('app', 'Are you sure you want to delete this address?'))) {
                    this.$addBtn.addClass('loading');
                    Craft.sendActionRequest('POST', 'elements/delete', {
                        data: {
                            elementId: $card.data('id'),
                            draftId: $card.data('draft-id'),
                        },
                    }).then(() => {
                        $card.remove();
                        this.$cards = this.$cards.not($card);
                        this.updateAddButton();
                    }).finally(() => {
                        this.$addBtn.removeClass('loading');
                    });
                }
            });
        }
    },

    editAddress: function($card, settings) {
        const slideout = Craft.createElementEditor('craft\\elements\\Address', $card, settings);

        slideout.on('submit', ev => {
            Craft.sendActionRequest('POST', 'addresses/card-html', {
                data: {
                    addressId: ev.data.id,
                }
            }).then(response => {
                const $newCard = $(response.data.html);
                if ($card) {
                    $card.replaceWith($newCard);
                    this.$cards = this.$cards.not($card);
                } else {
                    $newCard.insertBefore(this.$addBtn);
                }
                Craft.initUiElements($newCard);
                this.initCard($newCard);
                this.$cards = this.$cards.add($newCard);
                this.updateAddButton();
            });
        });
    },

    updateAddButton: function() {
        if (this.canCreateAddress()) {
            this.$addBtn.removeClass('hidden');
        } else {
            this.$addBtn.addClass('hidden');
        }
    },

    canCreateAddress: function() {
        return !this.settings.maxAddresses || this.$cards.length < this.settings.maxAddresses;
    },

    createAddress: function() {
        if (!this.canCreateAddress()) {
            throw 'No more addresses can be created.';
        }

        this.$addBtn.addClass('loading');

        Craft.sendActionRequest('POST', 'elements/create', {
            data: {
                elementType: 'craft\\elements\\Address',
                ownerId: this.settings.ownerId,
            },
        }).then(ev => {
            this.editAddress(null, {
                elementId: ev.data.element.id,
                draftId: ev.data.element.draftId,
            });
        }).finally(() => {
            this.$addBtn.removeClass('loading');
        });
    }
}, {
    ownerId: null,
    defaults: {
        maxAddresses: null,
    }
});
