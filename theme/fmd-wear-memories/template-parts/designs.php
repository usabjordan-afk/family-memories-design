<?php
/**
 * Design library (numbered tiles).
 *
 * @package fmd
 */

$fmd_designs = fmd_get_designs();
?>
<section class="sec sec--lilac designs" id="designs" aria-labelledby="designs-title">
	<div class="wrap">
		<header class="sec__head sec__head--split">
			<h2 class="h2" id="designs-title">Design library</h2>
			<p class="lede">Each design can carry your tournament name and date. Tap one to try it on in 3D.</p>
		</header>
		<ol class="tiles">
			<?php foreach ( $fmd_designs as $fmd_d ) : ?>
				<li class="tiles__item">
					<button type="button" class="tile" data-design="<?php echo esc_attr( $fmd_d['num'] ); ?>">
						<span class="tile__num mono">Design <?php echo esc_html( $fmd_d['num'] ); ?></span>
						<span class="tile__art">
							<img src="<?php echo esc_url( $fmd_d['src'] ); ?>" alt="" width="1000" height="1000" loading="lazy" decoding="async">
						</span>
						<span class="tile__foot">
							<span class="tile__name"><?php echo esc_html( $fmd_d['title'] ); ?></span>
							<span class="tile__try mono">Try on</span>
						</span>
					</button>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
