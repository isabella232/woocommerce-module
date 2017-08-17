<?php
$cards = array( 'visa', 'hipercard', 'mcard', 'elo', 'amex', 'hiper' );
shuffle( $cards );
?>
<div id="ppp-dummy">
    <div class="ppp-dummy-logo">
        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_powered_by_130x27_2x.png">
    </div>
    <div class="ppp-dummy-card-list">
		<?php foreach ( $cards as $card ): ?>
            <div class="card"><span class="ccard <?php echo $card; ?>"></span></div>
		<?php endforeach; ?>
    </div>
    <div class="ppp-dummy-card-input">
        <div class="ppp-dummy-input-credit-card ppp-dummy-input-credit-card-generic">
            <input type="text" placeholder="Número do cartão">
            <span class="ppp-dummy-card-input-icon"></span>
        </div>
    </div>
    <div class="ppp-dummy-row">
        <div class="ppp-dummy-half">
            <label class="ppp-dummy-label">Vencimento</label>
            <div class="ppp-dummy-flex">
                <div class="ppp-dummy-input-dropdown">
                    <input type="text" value="MM">
                </div>
                <div class="ppp-dummy-input-dropdown">
                    <input type="text" value="DD">
                </div>
            </div>
        </div>
        <div class="ppp-dummy-half">
            <label class="ppp-dummy-label">Cód Seg</label>
            <div class="ppp-dummy-input-credit-card ppp-dummy-input-credit-card-ccv">
                <input type="text" placeholder="3 dígitos">
                <span class="ppp-dummy-card-input-icon"></span>
            </div>
        </div>
    </div>
    <div class="ppp-dummy-installments">
        <div class="ppp-dummy-input-dropdown">
            <input type="text" value="Selecionar parcelas para esta compra">
        </div>
    </div>
    <div class="ppp-dummy-politice">
        <p>Suas informações serão coletadas de acordo com a <a href="#">Política de Privacidade do PayPal</a>.</p>
    </div>
    <div class="ppp-dummy-newsletter">
        <span class="fake-checkbox"></span>
        <p>Eu quero receber informações importantes, ofertas especiais e descontos do PayPal.</p>
    </div>
</div>