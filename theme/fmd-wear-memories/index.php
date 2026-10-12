<?php
/**
 * Fallback for posts, pages and archives.
 *
 * @package fmd
 */

get_header();
?>
<section class="sec page">
	<div class="wrap page__wrap">
		<?php if ( have_posts() ) : ?>
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article <?php post_class( 'page__article' ); ?>>
					<h1 class="h2"><?php the_title(); ?></h1>
					<div class="prose"><?php is_singular() ? the_content() : the_excerpt(); ?></div>
					<?php if ( ! is_singular() ) : ?>
						<a class="btn btn--line" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read', 'fmd' ); ?></a>
					<?php endif; ?>
				</article>
			<?php endwhile; ?>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<h1 class="h2"><?php esc_html_e( 'Nothing here yet', 'fmd' ); ?></h1>
			<a class="btn btn--accent" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to the home page', 'fmd' ); ?></a>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
