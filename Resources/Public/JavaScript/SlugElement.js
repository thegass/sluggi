define(['require', 'exports', 'TYPO3/CMS/Core/Ajax/AjaxRequest', 'TYPO3/CMS/Core/DocumentService', 'TYPO3/CMS/Core/Event/DebounceEvent', 'TYPO3/CMS/Core/Event/RegularEvent'], (function (e, t, i, s, l, n) {
    'use strict';
    var o, a;
    !function (e) {
        e.toggleButton = '.t3js-form-field-slug-toggle', e.recreateButton = '.t3js-form-field-slug-recreate', e.inputField = '.t3js-form-field-slug-input', e.readOnlyField = '.t3js-form-field-slug-readonly', e.hiddenField = '.t3js-form-field-slug-hidden';
    }(o || (o = {})), function (e) {
        e.AUTO = 'auto', e.RECREATE = 'recreate', e.MANUAL = 'manual';
    }(a || (a = {}));
    return class {
        constructor (e, t) {
            this.options = null, this.fullElement = null, this.manuallyChanged = !1, this.readOnlyField = null, this.inputField = null, this.hiddenField = null, this.request = null, this.fieldsToListenOn = {}, this.options = t, this.fieldsToListenOn = this.options.listenerFieldNames || {}, s.ready().then(t => {
                this.fullElement = t.querySelector(e), this.inputField = this.fullElement.querySelector(o.inputField), this.readOnlyField = this.fullElement.querySelector(o.readOnlyField), this.hiddenField = this.fullElement.querySelector(o.hiddenField), this.registerEvents();
            });
        }

        registerEvents () {
            const e = Object.values(this.getAvailableFieldsForProposalGeneration()).map(e => `[data-formengine-input-name="${e}"]`),
                t = this.fullElement.querySelector(o.recreateButton);
            e.length > 0 && 'new' === this.options.command && new l('input', () => {
                this.manuallyChanged || this.sendSlugProposal(a.AUTO);
            }).delegateTo(document, e.join(',')), e.length > 0 || this.hasPostModifiersDefined() ? new n('click', e => {
                e.preventDefault(), this.readOnlyField.classList.contains('hidden') && (this.readOnlyField.classList.toggle('hidden', !1), this.inputField.classList.toggle('hidden', !0)), this.sendSlugProposal(a.RECREATE);
            }).bindTo(t) : (t.classList.add('disabled'), t.disabled = !0), new l('input', () => {
                this.manuallyChanged = !0, this.sendSlugProposal(a.MANUAL);
            }).bindTo(this.inputField);
            const i = this.fullElement.querySelector(o.toggleButton);
            new n('click', e => {
                e.preventDefault();
                const t = this.readOnlyField.classList.contains('hidden');
                this.readOnlyField.classList.toggle('hidden', !t), this.inputField.classList.toggle('hidden', t), t ? (this.inputField.value !== this.readOnlyField.value ? this.readOnlyField.value = this.inputField.value : (this.manuallyChanged = !1, this.fullElement.querySelector('.t3js-form-proposal-accepted').classList.add('hidden'), this.fullElement.querySelector('.t3js-form-proposal-different').classList.add('hidden')), this.hiddenField.value = this.readOnlyField.value) : this.hiddenField.value = this.inputField.value;
            }).bindTo(i);
        }

        sendSlugProposal (e) {
            const t = {};
            if (e === a.AUTO || e === a.RECREATE) {
                for (const [e, i] of Object.entries(this.getAvailableFieldsForProposalGeneration())) t[e] = document.querySelector('[data-formengine-input-name="' + i + '"]').value;
                !0 === this.options.includeUidInValues && (t.uid = this.options.recordId.toString());
            } else t.manual = this.inputField.value;
            this.request instanceof i && this.request.abort(), this.request = new i(TYPO3.settings.ajaxUrls.record_slug_suggest), this.request.post({
                values: t,
                mode: e,
                tableName: this.options.tableName,
                pageId: this.options.pageId,
                parentPageId: this.options.parentPageId,
                recordId: this.options.recordId,
                language: this.options.language,
                fieldName: this.options.fieldName,
                command: this.options.command,
                signature: this.options.signature
            }).then(async t => {
                let i = await t.resolve();
                const s = '/' + i.proposal.replace(/^\//, ''),
                    l = this.fullElement.querySelector('.t3js-form-proposal-accepted'),
                    n = this.fullElement.querySelector('.t3js-form-proposal-different');
                // Sluggi
                if (i.inaccessibleSegments) {
                    i.proposal = i.proposal.substring(i.inaccessibleSegments.length);
                }
                // Sluggi
                if (i.lastSegmentOnly) {
                    i.proposal = i.proposal.substring(i.proposal.lastIndexOf("/"));
                }
                l.classList.toggle('hidden', i.hasConflicts), n.classList.toggle('hidden', !i.hasConflicts), (i.hasConflicts ? n : l).querySelector('span').innerText = s;
                this.hiddenField.value !== i.proposal && this.fullElement.querySelector('input[data-formengine-input-name]').dispatchEvent(new Event('change', {
                    bubbles: !0,
                    cancelable: !0
                })), e === a.AUTO || e === a.RECREATE ? (this.readOnlyField.value = i.proposal, this.hiddenField.value = i.proposal, this.inputField.value = i.proposal) : this.hiddenField.value = i.proposal;
            }).finally(() => {
                this.request = null;
            });
        }

        getAvailableFieldsForProposalGeneration () {
            const e = {};
            for (const [t, i] of Object.entries(this.fieldsToListenOn)) {null !== document.querySelector('[data-formengine-input-name="' + i + '"]') && (e[t] = i);}
            return e;
        }

        hasPostModifiersDefined () {
            return Array.isArray(this.options.config.generatorOptions.postModifiers) && this.options.config.generatorOptions.postModifiers.length > 0;
        }
    };
}));