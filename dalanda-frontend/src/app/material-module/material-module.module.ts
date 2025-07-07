import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material modules you actually need:
import { MatToolbarModule    } from '@angular/material/toolbar';
import { MatSidenavModule    } from '@angular/material/sidenav';
import { MatIconModule       } from '@angular/material/icon';
import { MatListModule       } from '@angular/material/list';
import { MatCardModule       } from '@angular/material/card';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { MatInputModule      } from '@angular/material/input';
import { MatButtonModule     } from '@angular/material/button';
import { MatSelectModule     } from '@angular/material/select';
import { MatSnackBarModule   } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    // you can also put CommonModule in AppModule; either way
  ],
  exports: [
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialModule {}
