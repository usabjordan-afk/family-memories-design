<?php
/**
 * 3D studio. The WebGL module loads only when this section nears the screen.
 *
 * @package fmd
 */

$fmd_garments = array(
	'hoodie' => 'Hoodie',
	'crew'   => 'Crewneck',
	'tee'    => 'T-shirt',
);
$fmd_colors   = array(
	'black'   => array( 'Black', '#161616' ),
	'white'   => array( 'White', '#F3F2EF' ),
	'heather' => array( 'Heather', '#B4B2B8' ),
	'navy'    => array( 'Navy', '#1C2541' ),
	'royal'   => array( 'Royal', '#2747A8' ),
	'forest'  => array( 'Forest', '#21402E' ),
	'red'     => array( 'Red', '#B0221B' ),
	'lilac'   => array( 'Lilac', '#CFC2F0' ),
);
$fmd_inks     = array(
	'auto'   => 'Auto',
	'black'  => 'Black',
	'white'  => 'White',
	'violet' => 'Violet',
);
?>
<section class="sec studio" id="studio" aria-labelledby="studio-title">
	<div class="wrap">
		<header class="sec__head">
			<h2 class="h2" id="studio-title">Build it in 3D</h2>
			<p class="lede">Pick the garment and color, put a logo or design on the chest and a name and number on the back. Send it with your booking or show it at the tent.</p>
		</header>

		<div class="studio__grid" data-studio>
			<div class="stage proof" data-stage>
				<?php fmd_crop_marks(); ?>
				<canvas class="stage__canvas" data-canvas aria-label="3D preview of your garment. Drag sideways to turn it." role="img"></canvas>
				<div class="stage__poster" data-poster>
					<?php fmd_reg_mark( 'reg stage__reg' ); ?>
					<span class="mono" data-poster-text>Loading the 3D studio</span>
				</div>
				<div class="stage__hud mono" aria-hidden="true">
					<span data-hud-garment>Hoodie</span>
					<span data-hud-color>Black</span>
				</div>
				<div class="stage__views seg seg--sm" role="group" aria-label="View">
					<button type="button" class="seg__btn" data-view="front" aria-pressed="true">Front</button>
					<button type="button" class="seg__btn" data-view="back" aria-pressed="false">Back</button>
				</div>
				<p class="stage__hint mono" aria-hidden="true">Drag to turn</p>
			</div>

			<form class="controls" data-controls novalidate>
				<fieldset class="ctl">
					<legend class="ctl__label">Garment</legend>
					<div class="seg">
						<?php foreach ( $fmd_garments as $fmd_k => $fmd_label ) : ?>
							<label class="seg__opt">
								<input type="radio" name="garment" value="<?php echo esc_attr( $fmd_k ); ?>" id="g-<?php echo esc_attr( $fmd_k ); ?>" <?php checked( 'hoodie', $fmd_k ); ?>>
								<span><?php echo esc_html( $fmd_label ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<fieldset class="ctl">
					<legend class="ctl__label">Color <span class="ctl__value" data-color-name>Black</span></legend>
					<div class="swatches">
						<?php foreach ( $fmd_colors as $fmd_k => $fmd_c ) : ?>
							<label class="swatch" title="<?php echo esc_attr( $fmd_c[0] ); ?>">
								<input type="radio" name="color" value="<?php echo esc_attr( $fmd_k ); ?>" id="c-<?php echo esc_attr( $fmd_k ); ?>" data-hex="<?php echo esc_attr( $fmd_c[1] ); ?>" data-name="<?php echo esc_attr( $fmd_c[0] ); ?>" <?php checked( 'black', $fmd_k ); ?>>
								<span class="swatch__chip" style="background:<?php echo esc_attr( $fmd_c[1] ); ?>"></span>
								<span class="sr"><?php echo esc_html( $fmd_c[0] ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<fieldset class="ctl">
					<legend class="ctl__label">Front <span class="ctl__value" data-front-name>Design 02</span></legend>
					<div class="ctl__row">
						<label class="btn btn--line btn--file" for="studio-logo">
							<input type="file" id="studio-logo" accept="image/png,image/jpeg,image/webp" data-logo-input>
							<span>Upload your logo</span>
						</label>
						<a class="ctl__link" href="#designs">Pick a design</a>
					</div>
					<p class="ctl__note" data-logo-note>PNG with a transparent background works best.</p>
				</fieldset>

				<fieldset class="ctl">
					<legend class="ctl__label">Back</legend>
					<div class="ctl__pair">
						<label class="field">
							<span class="field__label">Name</span>
							<input class="field__input" type="text" id="studio-name" name="name" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="RIVERA" data-back-name>
						</label>
						<label class="field field--num">
							<span class="field__label">Number</span>
							<input class="field__input" type="text" id="studio-number" name="number" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="10" data-back-number>
						</label>
					</div>
				</fieldset>

				<fieldset class="ctl">
					<legend class="ctl__label">Ink</legend>
					<div class="seg">
						<?php foreach ( $fmd_inks as $fmd_k => $fmd_label ) : ?>
							<label class="seg__opt">
								<input type="radio" name="ink" value="<?php echo esc_attr( $fmd_k ); ?>" id="i-<?php echo esc_attr( $fmd_k ); ?>" <?php checked( 'auto', $fmd_k ); ?>>
								<span><?php echo esc_html( $fmd_label ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<div class="ctl ctl--end">
					<button type="button" class="btn btn--accent btn--wide" data-send-design>Add this design to my booking</button>
				</div>
			</form>
		</div>
	</div>
</section>
