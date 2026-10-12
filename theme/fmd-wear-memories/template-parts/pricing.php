<?php
/**
 * Event-day price list — main items only.
 *
 * @package fmd
 */

$fmd_rows = array(
	array( 'Solid T-shirt', '$30' ),
	array( 'Tie-dye T-shirt', '$37' ),
	array( 'Dry-fit T-shirt', '$42' ),
	array( 'Tank top', '$32' ),
	array( 'Solid sweatshirt', '$58' ),
	array( 'Tie-dye sweatshirt', '$68' ),
	array( 'Name + number', '$12' ),
);
?>
<section class="sec prices" id="prices" aria-labelledby="prices-title">
	<div class="wrap">
		<header class="sec__head sec__head--split">
			<h2 class="h2" id="prices-title">Prices</h2>
			<p class="lede">Live event pricing — printed on the spot. Sales tax added at checkout.</p>
		</header>
		<ul class="price-list">
			<?php foreach ( $fmd_rows as $fmd_r ) : ?>
				<li class="price">
					<span class="price__name"><?php echo esc_html( $fmd_r[0] ); ?></span>
					<span class="price__amount"><span class="price__value"><?php echo esc_html( $fmd_r[1] ); ?></span></span>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
